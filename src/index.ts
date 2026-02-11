import express, { type Request, type Response } from "express";
import nunjucks from "nunjucks";

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

nunjucks.configure("templates", {
	autoescape: true,
	express: app,
});

app.get("/", (_req: Request, res: Response) => {
	res.render("index.html");
});

app.get("/login", (_req: Request, res: Response) => {
	res.render("login.html");
});

app.post("/login", (req: Request, res: Response) => {
	const { email, password } = req.body as { email?: string; password?: string };
	console.log("Login attempt", { email, passwordPresent: Boolean(password) });
	res.status(200).send("Login received");
});

app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
