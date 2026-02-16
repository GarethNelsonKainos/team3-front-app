import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/index";

describe("GET /job-applications", () => {
	it("should render the job applications page with mock data", async () => {
		const response = await request(app).get("/job-applications");
		expect(response.status).toBe(200);
		expect(response.text).toContain("My Job Applications");
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("in progress");
		expect(response.text).toContain("hired");
		expect(response.text).toContain("rejected");
	});
});
