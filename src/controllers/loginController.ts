import { type Request, type Response, Router } from "express";
import { validateLogin } from "../utils/login";

const router = Router();

router.get("/login", (_req: Request, res: Response) => {
	try {
		res.render("login.html");
	} catch (err) {
		console.error("Failed to load login page", err);
		res.status(500).send("Failed to load login page");
	}
});

router.post("/login", (req: Request, res: Response) => {
	try {
		const { email, password } = req.body as {
			email?: string;
			password?: string;
		};
		const validation = validateLogin(email, password);
		if (!validation.valid) {
			res.status(400).json({ errors: validation.errors });
			return;
		}
		res.status(200).json({ message: "Login valid" });
	} catch (err) {
		console.error("Login error", err);
		res.status(500).json({ error: "Login failed" });
	}
});

export default router;
