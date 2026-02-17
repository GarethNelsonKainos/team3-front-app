import { type Request, type Response, Router } from "express";

const router = Router();

// Mock data for job applications (replace with real data when backend is ready)
const mockApplications = [
	{
		applicationId: 1,
		roleName: "Data Analyst",
		roleId: 1,
		status: "in progress",
	},
	{
		applicationId: 2,
		roleName: "Product Manager",
		roleId: 2,
		status: "hired",
	},
	{
		applicationId: 3,
		roleName: "Software Engineer",
		roleId: 3,
		status: "rejected",
	},
];

router.get("/job-applications", (req: Request, res: Response) => {
	const token = req.cookies?.token;
	if (!token) {
		return res.redirect("/login");
	}
	// In a real app, fetch applications for the logged-in user
	res.render("job-applications.html", { applications: mockApplications });
});

export default router;
