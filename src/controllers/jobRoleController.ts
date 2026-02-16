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

const router = Router();

router.get("/job-roles", async (req: Request, res: Response) => {
	try {
		const capability = getStringArray(req.query.capability);
		const band = getStringArray(req.query.band);
		const filters = {
			roleName: getString(req.query.roleName),
			location: getString(req.query.location),
			closingDate: getString(req.query.closingDate),
			capability: capability.length > 0 ? capability : undefined,
			band: band.length > 0 ? band : undefined,
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
		res.render("job-role-list.html", {
			roles,
			filters,
			capabilityOptions,
			bandOptions,
			showRoleFilteringUI,
		});
	} catch (err) {
		console.error("Failed to load job roles", err);
		res.render("job-role-list.html", {
			roles: [],
			filters: {
				roleName: undefined,
				location: undefined,
				closingDate: undefined,
				capability: undefined,
				band: undefined,
			},
			capabilityOptions: [],
			bandOptions: [],
			showRoleFilteringUI,
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
