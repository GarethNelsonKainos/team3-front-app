import { type Request, type Response, Router } from "express";
import { validateLogin } from "../utils/login.js";
import authService from "../services/authService.js";

const router = Router();

router.get("/login", (_req: Request, res: Response) => {
	try {
		res.render("login.html", { error: null });
	} catch (err) {
		console.error("Failed to load login page", err);
		res.status(500).send("Failed to load login page");
	}
});

router.post("/login", async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body as {
			email?: string;
			password?: string;
		};
		const validation = validateLogin(email, password);
		if (!validation.valid) {
			res.render("error.html", {
				error: "Please provide a valid email and password.",
			});
			return;
		}
		const token = await authService.login(email as string, password as string);
		// Store token in a cookie so server-side routes can read it
		res.cookie("token", token, {
			httpOnly: false,
			sameSite: "strict",
			maxAge: 8 * 60 * 60 * 1000, // 8 hours
		});
		res.redirect("/job-roles");
	} catch (err: any) {
		console.error("Login error", err?.response?.status, err?.message);
		const message =
			err?.response?.status === 401
				? "Invalid email or password."
				: "Login failed. Please try again.";
		res.status(401).render("login.html", { error: message });
		return;
	}
});

router.get("/logout", (_req: Request, res: Response) => {
	res.clearCookie("token");
	res.redirect("/");
});

export default router;
