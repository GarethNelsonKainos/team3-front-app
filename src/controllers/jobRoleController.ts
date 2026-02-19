import { type Request, type Response, Router } from "express";
import FormData from "form-data";
import jobRoleService from "../services/jobRoleService.js";
import { uploadCV } from "../services/uploadService.js";
import upload from "../utils/upload.js";

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
		let canApply = false;
		if (role && (role.numberOfOpenPositions ?? 0) > 0) {
			canApply = true;
		}
		res.render("job-role-information.html", { role, canApply });
	} catch (err) {
		console.error("Failed to load job role", err);
		res.render("job-role-information.html", {
			role: undefined,
			canApply: false,
		});
	}
});

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
router.post(
	"/job-roles/:id/apply",
	(req, res, next) => {
		upload.single("cv")(req, res, (err) => {
			if (err) {
				return (async () => {
					const id = String(req.params.id);
					const token = req.cookies?.token as string | undefined;
					const role = await jobRoleService.getJobRoleById(id, token);
					res.render("job-role-apply.html", {
						role,
						submitted: false,
						error: err.message,
					});
				})();
			} else {
				next();
			}
		});
	},
	async (req: Request, res: Response) => {
		let role:
			| Awaited<ReturnType<typeof jobRoleService.getJobRoleById>>
			| undefined;
		try {
			const id = String(req.params.id);
			const token = req.cookies?.token as string | undefined;
			role = await jobRoleService.getJobRoleById(id, token);

			if (!req.file) {
				return res.render("job-role-apply.html", {
					role,
					submitted: false,
					error: "No file uploaded.",
				});
			}

			const formData = new FormData();
			formData.append("cv", req.file.buffer, {
				filename: req.file.originalname,
				contentType: req.file.mimetype,
			});

			await uploadCV(id, formData, token);

			res.render("job-role-apply.html", { role, submitted: true });
		} catch (err) {
			console.error("Failed to submit application", err);
			let message =(err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Error submitting application. Please try again.";
			res.render("job-role-apply.html", {
				role,
				submitted: false,
				error: message,
			});
		}
	},
);

export default router;
