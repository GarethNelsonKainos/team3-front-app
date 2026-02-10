import express, { Request, Response } from "express";
import nunjucks from "nunjucks";
import jobRoleController from "./controllers/jobRoleController";

const app = express();

nunjucks.configure("templates", {
  autoescape: true,
  express: app,
});

app.use(jobRoleController);

app.get("/", (req: Request, res: Response) => {
  res.render("index.html");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});