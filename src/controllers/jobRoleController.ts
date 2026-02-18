import { type Request, type Response, Router } from "express";
import jobRoleService from "../services/jobRoleService.js";

// Helper functions for query param parsing
function getString(value: unknown): string | undefined {
	return typeof value === "string" && value.trim().length > 0
		? value.trim()
		: undefined;
}
function getStringArray(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value
			.filter((item) => typeof item === "string" && item.trim().length > 0)
			.map((item) => item.trim());
	}
	if (typeof value === "string" && value.trim().length > 0) {
		return [value.trim()];
	}
	return [];
}

const showRoleFilteringUI = process.env.FEATURE_ROLE_FILTERING === "true";
const DEFAULT_PAGE_SIZE = 10;

const getAxiosStatus = (err: unknown): number | undefined => {
	const axiosErr = err as { response?: { status?: number } };
	return axiosErr.response?.status;
};

const getAxiosMessage = (err: unknown): string | undefined => {
	const axiosErr = err as { response?: { data?: { message?: string } } };
	return axiosErr.response?.data?.message;
};

const router = Router();

router.get("/job-roles", async (req: Request, res: Response) => {
	try {
		const capability = getStringArray(req.query.capability);
		const band = getStringArray(req.query.band);
		const rawPage = getString(req.query.page);
		const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : 1;
		const currentPage =
			Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
		const pageSize = DEFAULT_PAGE_SIZE;
		const fetchLimit = pageSize + 1;
		const offset = (currentPage - 1) * pageSize;

		// Validate orderDir
		const rawOrderDir = getString(req.query.orderDir);
		const orderDir: "asc" | "desc" | undefined =
			rawOrderDir === "asc" || rawOrderDir === "desc" ? rawOrderDir : undefined;

		// Validate orderBy
		const allowedOrderBy = [
			"roleName",
			"location",
			"capability",
			"band",
			"closingDate",
		];
		const rawOrderBy = getString(req.query.orderBy);
		const orderBy =
			rawOrderBy && allowedOrderBy.includes(rawOrderBy)
				? rawOrderBy
				: undefined;

		const baseFilters = {
			roleName: getString(req.query.roleName),
			location: getString(req.query.location),
			closingDate: getString(req.query.closingDate),
			capability: capability.length > 0 ? capability : undefined,
			band: band.length > 0 ? band : undefined,
		};
		const paginatedFilters = {
			...baseFilters,
			orderBy,
			orderDir,
			limit: fetchLimit,
			offset,
		};
		const optionFilters = {
			...baseFilters,
		};

		const token = req.cookies?.token as string | undefined;
		const { roles, totalCount } = await jobRoleService.getOpenJobRoles(
			paginatedFilters,
			token,
		);
		const fetchedRoles = Array.isArray(roles) ? roles : [];
		const safeRoles = fetchedRoles.slice(0, pageSize);
		const optionSourceRoles = showRoleFilteringUI
			? (await jobRoleService.getOpenJobRoles(optionFilters, token)).roles
			: safeRoles;
		const capabilityOptions = Array.from(
			new Set(
				optionSourceRoles
					.map((role) => role.capability?.capabilityName)
					.filter((value): value is string => Boolean(value)),
			),
		).sort();
		const bandOptions = Array.from(
			new Set(
				optionSourceRoles
					.map((role) => role.band?.bandName)
					.filter((value): value is string => Boolean(value)),
			),
		).sort();
		// Build base query string from filters (excluding sort) for sort links
		const filterParams = new URLSearchParams();
		if (baseFilters.roleName)
			filterParams.set("roleName", baseFilters.roleName);
		if (baseFilters.location)
			filterParams.set("location", baseFilters.location);
		if (baseFilters.closingDate)
			filterParams.set("closingDate", baseFilters.closingDate);
		if (baseFilters.capability) {
			for (const c of baseFilters.capability)
				filterParams.append("capability", c);
		}
		if (baseFilters.band) {
			for (const b of baseFilters.band) filterParams.append("band", b);
		}
		const filterQuery = filterParams.toString();
		const paginationParams = new URLSearchParams(filterQuery);
		if (orderBy) paginationParams.set("orderBy", orderBy);
		if (orderDir) paginationParams.set("orderDir", orderDir);
		const paginationQuery = paginationParams.toString();

		const totalPages =
			totalCount !== undefined
				? Math.max(1, Math.ceil(totalCount / pageSize))
				: undefined;
		const pagination = {
			currentPage,
			prevPage: currentPage > 1 ? currentPage - 1 : 1,
			nextPage: (
				totalPages !== undefined
					? currentPage < totalPages
					: fetchedRoles.length > pageSize
			)
				? currentPage + 1
				: currentPage,
			lastPage: totalPages ?? currentPage,
			totalPages,
			hasPrev: currentPage > 1,
			hasNext:
				totalPages !== undefined
					? currentPage < totalPages
					: fetchedRoles.length > pageSize,
			showLast: totalPages !== undefined,
			filterQuery,
			paginationQuery,
		};
		const options = {
			capability: capabilityOptions,
			band: bandOptions,
		};
		const showOrderingUI = process.env.FEATURE_ORDERING_UI === "true";
		res.render("job-role-list.html", {
			roles: safeRoles,
			filters: baseFilters,
			options,
			showRoleFilteringUI,
			orderBy,
			orderDir,
			pagination,
			showOrderingUI,
		});
	} catch (err) {
		console.error("Failed to load job roles", err);
		const showOrderingUI = process.env.FEATURE_ORDERING_UI === "true";
		res.render("job-role-list.html", {
			roles: [],
			filters: {},
			options: { capability: [], band: [] },
			showOrderingUI,
			showRoleFilteringUI,
			orderBy: undefined,
			orderDir: undefined,
			pagination: {
				currentPage: 1,
				prevPage: 1,
				nextPage: 1,
				lastPage: 1,
				totalPages: 1,
				hasPrev: false,
				hasNext: false,
				showLast: false,
				filterQuery: "",
				paginationQuery: "",
			},
		});
	}
});

router.get("/job-roles/:id", async (req: Request, res: Response) => {
	try {
		const id = String(req.params.id);
		const token = req.cookies?.token as string | undefined;
		const role = await jobRoleService.getJobRoleById(id, token);
		const successMessage = getString(req.query.success);
		const errorMessage = getString(req.query.error);

		const applicationsPanel = {
			visible: false,
			items: [] as Array<{
				applicationId: number;
				applicationStatus: string;
				applicantName: string;
				cvUrl?: string;
				canAssess: boolean;
			}>,
			success: successMessage,
			error: errorMessage,
		};

		if (role && token) {
			try {
				const applications = await jobRoleService.getJobRoleApplications(
					id,
					token,
				);
				applicationsPanel.visible = true;
				applicationsPanel.items = applications.map((application) => {
					const applicantName =
						application.email ||
						application.username ||
						application.user?.email ||
						application.user?.username ||
						"Unknown applicant";
					const statusLabel = application.applicationStatus || "Unknown";
					return {
						applicationId: application.applicationId,
						applicationStatus: statusLabel,
						applicantName,
						cvUrl: application.cvUrl,
						canAssess:
							statusLabel.toLowerCase() === "inprogress" ||
							statusLabel.toLowerCase() === "in progress",
					};
				});
			} catch (err) {
				const status = getAxiosStatus(err);
				if (status !== 401 && status !== 403) {
					applicationsPanel.visible = true;
					applicationsPanel.error =
						getAxiosMessage(err) || "Failed to load applications.";
				}
			}
		}

		let canApply = false;
		if (role && (role.numberOfOpenPositions ?? 0) > 0) {
			canApply = true;
		}
		res.render("job-role-information.html", {
			role,
			canApply,
			applicationsPanel,
		});
	} catch (err) {
		console.error("Failed to load job role", err);
		res.render("job-role-information.html", {
			role: undefined,
			canApply: false,
			applicationsPanel: {
				visible: false,
				items: [],
				success: undefined,
				error: undefined,
			},
		});
	}
});

router.post(
	"/job-roles/:id/applications/:applicationId/hire",
	async (req: Request, res: Response) => {
		const roleId = String(req.params.id);
		const applicationId = String(req.params.applicationId);
		const token = req.cookies?.token as string | undefined;
		if (!token) {
			res.redirect("/login");
			return;
		}

		try {
			await jobRoleService.hireApplication(applicationId, token);
			const success = encodeURIComponent("Application marked as Hired.");
			res.redirect(`/job-roles/${roleId}?success=${success}`);
			return;
		} catch (err) {
			const error = encodeURIComponent(
				getAxiosMessage(err) || "Could not hire applicant.",
			);
			res.redirect(`/job-roles/${roleId}?error=${error}`);
			return;
		}
	},
);

router.post(
	"/job-roles/:id/applications/:applicationId/reject",
	async (req: Request, res: Response) => {
		const roleId = String(req.params.id);
		const applicationId = String(req.params.applicationId);
		const token = req.cookies?.token as string | undefined;
		if (!token) {
			res.redirect("/login");
			return;
		}

		try {
			await jobRoleService.rejectApplication(applicationId, token);
			const success = encodeURIComponent("Application marked as Rejected.");
			res.redirect(`/job-roles/${roleId}?success=${success}`);
			return;
		} catch (err) {
			const error = encodeURIComponent(
				getAxiosMessage(err) || "Could not reject applicant.",
			);
			res.redirect(`/job-roles/${roleId}?error=${error}`);
			return;
		}
	},
);

// GET apply form
router.get("/job-roles/:id/apply", async (req: Request, res: Response) => {
	try {
		const id = String(req.params.id);
		const token = req.cookies?.token as string | undefined;
		const role = await jobRoleService.getJobRoleById(id, token);
		res.render("job-role-apply.html", { role, submitted: false });
	} catch (err) {
		console.error("Failed to load apply form", err);
		res.render("job-role-apply.html", { role: undefined, submitted: false });
	}
});

// POST apply form
router.post("/job-roles/:id/apply", async (req: Request, res: Response) => {
	try {
		const id = String(req.params.id);
		const token = req.cookies?.token as string | undefined;
		const role = await jobRoleService.getJobRoleById(id, token);
		res.render("job-role-apply.html", { role, submitted: !!role });
	} catch (err) {
		console.error("Failed to submit application", err);
		res.render("job-role-apply.html", { role: undefined, submitted: false });
	}
});

export default router;
