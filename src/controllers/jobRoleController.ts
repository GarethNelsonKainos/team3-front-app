import axios from "axios";
import { type Request, type Response, Router } from "express";

interface JobRole {
	numberOfOpenPositions?: number;
	[key: string]: any;
}

const router = Router();

// Helper to forward JWT cookie to backend API
function authHeaders(req: Request) {
	const token = req.cookies.token;
	return token ? { Cookie: `token=${token}` } : {};
}

// GET /job-roles
router.get("/job-roles", async (req: Request, res: Response) => {
	try {
		const response = await axios.get("/job-roles", {
			headers: authHeaders(req),
			withCredentials: true,
		});

		const roles = Array.isArray(response.data) ? response.data : [];
		res.render("job-role-list.html", { roles });
	} catch (err: any) {
		if (err?.response?.status === 401) {
			return res.redirect("/login");
		}
		res.render("job-role-list.html", { roles: [] });
	}
});

// GET /job-roles/:id
router.get("/job-roles/:id", async (req: Request, res: Response) => {
	try {
		const response = await axios.get(`/job-roles/${req.params.id}`, {
			headers: authHeaders(req),
			withCredentials: true,
		});

		const role = response.data as JobRole;
		const canApply = role && (role.numberOfOpenPositions ?? 0) > 0;

		res.render("job-role-information.html", { role, canApply });
	} catch (err: any) {
		if (err?.response?.status === 401) {
			return res.redirect("/login");
		}
		res.render("job-role-information.html", {
			role: undefined,
			canApply: false,
		});
	}
});

// GET apply form
router.get("/job-roles/:id/apply", async (req: Request, res: Response) => {
	try {
		const response = await axios.get(`/job-roles/${req.params.id}`, {
			headers: authHeaders(req),
			withCredentials: true,
		});

		res.render("job-role-apply.html", {
			role: response.data,
			submitted: false,
		});
	} catch (err: any) {
		if (err?.response?.status === 401) {
			return res.redirect("/login");
		}
		res.render("job-role-apply.html", {
			role: undefined,
			submitted: false,
		});
	}
});

// POST apply form
router.post("/job-roles/:id/apply", async (req: Request, res: Response) => {
	try {
		const response = await axios.post(
			`/job-roles/${req.params.id}/apply`,
			req.body,
			{
				headers: authHeaders(req),
				withCredentials: true,
			},
		);

		res.render("job-role-apply.html", {
			role: response.data,
			submitted: true,
		});
	} catch (err: any) {
		if (err?.response?.status === 401) {
			return res.redirect("/login");
		}
		res.render("job-role-apply.html", {
			role: undefined,
			submitted: false,
		});
	}
});

export default router;
