import { type Request, type Response, Router } from "express";
import jobRoleService from "../services/jobRoleService";

const router = Router();

router.get("/job-roles", async (_req: Request, res: Response) => {
	try {
		const roles = await jobRoleService.getOpenJobRoles();
		res.render("job-role-list.html", { roles });
	} catch (err) {
		console.error("Failed to load job roles", err);
		res.status(500).send("Failed to load job roles");
	}
});

router.get("/job-roles/:id", async (req: Request, res: Response) => {
	try {
		const id = String(req.params.id);
		const role = await jobRoleService.getJobRoleById(id);
		res.render("job-role-information.html", { role });
	} catch (err) {
		console.error("Failed to load job role", err);
		res.status(500).send("Failed to load job role");
	}
});

export default router;
