import express, { type Request, type Response } from "express";
import nunjucks from "nunjucks";

import jobRoleController from "./controllers/jobRoleController";

const app = express();

export function validateLogin(
	email?: string,
	password?: string,
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	if (!email) errors.push("Email is required");
	if (!password) errors.push("Password is required");
	return { valid: errors.length === 0, errors };
}

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

nunjucks.configure("templates", {
	autoescape: true,
	express: app,
});

app.use(jobRoleController);

app.get("/", (_req: Request, res: Response) => {
	res.render("index.html");
});

app.get("/login", (_req: Request, res: Response) => {
	res.render("login.html");
});

app.post("/login", (req: Request, res: Response) => {
	const { email, password } = req.body as { email?: string; password?: string };
	const validation = validateLogin(email, password);
	if (!validation.valid) {
		res.status(400).json({ errors: validation.errors });
		return;
	}
	res.status(200).json({ message: "Login valid" });
});

app.use((err: Error, _req: Request, res: Response) => {
	console.error(err);
	res.status(500).json({ error: err.message });
});

export { app };

app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
