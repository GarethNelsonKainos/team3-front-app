import { type Request, type Response, Router } from "express";
import jobRoleService from "../services/jobRoleService.js";

const router = Router();

router.get("/job-roles", async (_req: Request, res: Response) => {
	try {
		let roles = await jobRoleService.getOpenJobRoles();
		if (!Array.isArray(roles)) roles = [];
		res.render("job-role-list.html", { roles });
	} catch (err) {
		console.error("Failed to load job roles", err);
		res.render("job-role-list.html", { roles: [] });
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
