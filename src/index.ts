import express, { type Request, type Response } from "express";
import nunjucks from "nunjucks";

const app = express();

nunjucks.configure("templates", {
	autoescape: true,
	express: app,
});

app.get("/", (_req: Request, res: Response) => {
	res.render("index.html");
});

app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
