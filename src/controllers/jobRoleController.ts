import { type Request, type Response, Router } from "express";
import jobRoleService from "../services/jobRoleService.js";

const router = Router();

router.get("/job-roles", async (req: Request, res: Response) => {
	try {
		const getString = (value: unknown) =>
			typeof value === "string" && value.trim().length > 0
				? value.trim()
				: undefined;
		const getStringArray = (value: unknown) => {
			if (Array.isArray(value)) {
				return value
					.filter((item) => typeof item === "string" && item.trim().length > 0)
					.map((item) => item.trim());
			}
			if (typeof value === "string" && value.trim().length > 0) {
				return [value.trim()];
			}
			return [];
		};

		const capability = getStringArray(req.query.capability);
		const band = getStringArray(req.query.band);
		const filters = {
			roleName: getString(req.query.roleName),
			location: getString(req.query.location),
			closingDate: getString(req.query.closingDate),
			capability: capability.length > 0 ? capability : undefined,
			band: band.length > 0 ? band : undefined,
			orderBy: getString(req.query.orderBy),
			orderDir: getString(req.query.orderDir) as 'asc' | 'desc' | undefined,
		};

		let roles = await jobRoleService.getOpenJobRoles(filters);
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
		if (filters.roleName) baseParams.set('roleName', filters.roleName);
		if (filters.location) baseParams.set('location', filters.location);
		if (filters.closingDate) baseParams.set('closingDate', filters.closingDate);
		if (filters.capability) {
			for (const c of filters.capability) baseParams.append('capability', c);
		}
		if (filters.band) {
			for (const b of filters.band) baseParams.append('band', b);
		}
		const baseQuery = baseParams.toString();

		res.render("job-role-list.html", {
			roles,
			filters: filters || {},
			capabilityOptions,
			bandOptions,
			orderBy: filters.orderBy,
			orderDir: filters.orderDir,
			baseQuery,
		});
	} catch (err) {
		console.error("Failed to load job roles", err);
		res.render("job-role-list.html", {
			roles: [],
			filters: {},
			capabilityOptions: [],
			bandOptions: [],
			baseQuery: '',
		});
	}
});

router.get("/job-roles/:id", async (req: Request, res: Response) => {
	try {
		const id = String(req.params.id);
		const role = await jobRoleService.getJobRoleById(id);
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
		const role = await jobRoleService.getJobRoleById(id);
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
		const role = await jobRoleService.getJobRoleById(id);
		res.render("job-role-apply.html", { role, submitted: !!role });
	} catch (err) {
		console.error("Failed to submit application", err);
		res.render("job-role-apply.html", { role: undefined, submitted: false });
	}
});

export default router;
