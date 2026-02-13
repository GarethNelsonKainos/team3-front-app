import cookieParser from "cookie-parser";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import nunjucks from "nunjucks";
import jobRoleController from "./controllers/jobRoleController.js";
import loginController from "./controllers/loginController.js";

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

nunjucks.configure("templates", {
	autoescape: true,
	express: app,
});

// Make token available to all templates
app.use((req: Request, res: Response, next: NextFunction) => {
	res.locals.token = req.cookies?.token || null;
	next();
});

app.use(jobRoleController);
app.use(loginController);

app.get("/", (_req: Request, res: Response) => {
	res.render("index.html");
});

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
	console.error(err);
	res.status(500).send(`error: ${err.message}`);
	next(err);
});

export { app };

app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
