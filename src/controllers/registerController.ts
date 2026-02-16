import { type Request, type Response, Router } from "express";
import { register } from "../services/authService.js";
import { ConflictError, ValidationError } from "../utils/errors.js";
import { validateLogin } from "../utils/login.js";

const router = Router();

router.get("/register", (_req: Request, res: Response) => {
	res.render("register.html", { error: null });
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
		await register(req.body.email, req.body.password);
		res.render("login.html", {
			success: "Registration successful. Please log in.",
			error: null,
			email,
		});
	} catch (err) {
		console.error("Registration error", err);
		let message = "Registration failed. Please try again.";

		if (err instanceof ValidationError || err instanceof ConflictError) {
			message = err.message;
		} else if (err && typeof err === "object" && "response" in err) {
			const response = (err as any).response;
			const status = response?.status;
			if (status >= 400 && status < 500 && response?.data?.message) {
				message = response.data.message;
			}
		}

		res.status(400).render("register.html", {
			error: message,
			email: req.body.email,
		});
		return;
	}
});

export default router;
