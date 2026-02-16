import path from "node:path";
import cookieParser from "cookie-parser";
import express from "express";
import nunjucks from "nunjucks";
import request from "supertest";
import { describe, expect, it } from "vitest";
import jobApplicationController from "../../src/controllers/jobApplicationController";

const app = express();
app.use(cookieParser());

nunjucks.configure(path.join(__dirname, "../../templates"), {
	autoescape: true,
	express: app,
});

app.use("/", jobApplicationController);

describe("GET /job-applications", () => {
	it("should render the job applications page with mock data when logged in", async () => {
		const response = await request(app)
			.get("/job-applications")
			.set("Cookie", "token=mock-token");
		expect(response.status).toBe(200);
		expect(response.text).toContain("My Job Applications");
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("in progress");
		expect(response.text).toContain("hired");
		expect(response.text).toContain("rejected");
	});

	it("should redirect to /login when not logged in", async () => {
		const response = await request(app).get("/job-applications");
		expect(response.status).toBe(302);
		expect(response.header.location).toBe("/login");
	});
});
