import { type Request, type Response, Router } from "express";
import { register } from "../services/authService.js";
import { validateLogin } from "../utils/login.js";

const router = Router();

router.get("/register", (_req: Request, res: Response) => {
	try {
		res.render("register.html", { error: null });
	} catch (err) {
		console.error("Failed to load registration page", err);
		res.status(500).send("Failed to load registration page");
	}
});

router.post("/register", async (req: Request, res: Response) => {
	const { email, password } = req.body as {
		email?: string;
		password?: string;
	};

	const validation = validateLogin(email, password);
	if (!validation.valid) {
		res.status(400).render("register.html", {
			error: "Please provide a valid email and password.",
			email,
		});
		return;
	}
	try {
		await register(email as string, password as string);
		res.redirect("/login");
	} catch (err) {
		console.error("Registration failed", err);
		res
			.status(400)
			.render("register.html", {
				error: "Registration failed. Please try again.",
				email,
			});
	}
});

export default router;
