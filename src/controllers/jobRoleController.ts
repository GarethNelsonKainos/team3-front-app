import axios from "axios";
import dotenv from "dotenv";
import { type Request, type Response, Router } from "express";
import FormData from "form-data";
import jobRoleService from "../services/jobRoleService.js";
import upload from "../utils/upload.js";

dotenv.config();

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

const router = Router();

router.get("/job-roles", async (req: Request, res: Response) => {
	try {
		const capability = getStringArray(req.query.capability);
		const band = getStringArray(req.query.band);

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

		const filters = {
			roleName: getString(req.query.roleName),
			location: getString(req.query.location),
			closingDate: getString(req.query.closingDate),
			capability: capability.length > 0 ? capability : undefined,
			band: band.length > 0 ? band : undefined,
			orderBy,
			orderDir,
		};

		const token = req.cookies?.token as string | undefined;

		if (!token) {
			if (req.accepts("html")) {
				return res.render("login.html", {
					error: "Please log in to view job roles",
				});
			} else {
				return res.status(401).json({ error: "Missing token" });
			}
		}

		let roles = await jobRoleService.getOpenJobRoles(filters, token);
		if (!Array.isArray(roles)) roles = [];
		const capabilityOptions = Array.from(
			new Set(
				roles
					.map((role) => role.capability?.capabilityName)
					.filter((value): value is string => Boolean(value)),
			),
		).sort();
		const bandOptions = Array.from(
			new Set(
				roles
					.map((role) => role.band?.bandName)
					.filter((value): value is string => Boolean(value)),
			),
		).sort();
		// Build base query string from filters (excluding sort) for sort links
		const baseParams = new URLSearchParams();
		if (filters.roleName) baseParams.set("roleName", filters.roleName);
		if (filters.location) baseParams.set("location", filters.location);
		if (filters.closingDate) baseParams.set("closingDate", filters.closingDate);
		if (filters.capability) {
			for (const c of filters.capability) baseParams.append("capability", c);
		}
		if (filters.band) {
			for (const b of filters.band) baseParams.append("band", b);
		}
		const baseQuery = baseParams.toString();

		const showOrderingUI = process.env.FEATURE_ORDERING_UI === "true";
		res.render("job-role-list.html", {
			roles,
			filters,
			capabilityOptions,
			bandOptions,
			showRoleFilteringUI,
			orderBy: filters.orderBy,
			orderDir: filters.orderDir,
			baseQuery,
			showOrderingUI,
		});
	} catch (err) {
		console.error("Failed to load job roles", err);
		const showOrderingUI = process.env.FEATURE_ORDERING_UI === "true";
		res.render("job-role-list.html", {
			roles: [],
			filters: {},
			capabilityOptions: [],
			bandOptions: [],
			baseQuery: "",
			showOrderingUI,
			showRoleFilteringUI,
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

			const backendUrl = process.env.API_URL || "http://localhost:3001";
			const apiUrl = `${backendUrl}/job-roles/${id}/apply`;

			await axios.post(apiUrl, formData, {
				headers: {
					...formData.getHeaders(),
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
			});

			res.render("job-role-apply.html", { role, submitted: true });
		} catch (err) {
			console.error("Failed to submit application", err);
			res.render("job-role-apply.html", {
				role,
				submitted: false,
				error: "Failed to submit application.",
			});
		}
	},
);

export default router;
