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
		//Default to status 500 and a default message unless specified error type is received
		let message = "An error occurred during registration";
		let statusCode = 500;

		if (err instanceof ValidationError) {
			message = err.message;
			statusCode = 400;
		} else if (err instanceof ConflictError) {
			message = err.message;
			statusCode = 409;
		} else if (err && typeof err === "object" && "response" in err) {
			const axiosError = err as {
				response?: {
					status?: number;
					data?: { message?: string };
				};
			};

			statusCode = axiosError.response?.status ?? 500;
			message =
				axiosError.response?.data?.message ??
				"An error occurred during registration";
		} else if (err instanceof Error) {
			message = err.message;
		}

		res.status(statusCode).render("register.html", {
			error: message,
			email: req.body.email,
		});
		return;
	}
});

export default router;
