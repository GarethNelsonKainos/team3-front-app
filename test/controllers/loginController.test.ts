import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/index";

describe("POST /login", () => {
	it("should handle valid login credentials", async () => {
		const response = await request(app)
			.post("/login")
			.set("Content-Type", "application/json")
			.send({ email: "test@example.com", password: "password123" });
		expect(response.status).toBe(200);
		expect(response.body.message).toBe("Login valid");
	});

	it("should return error with missing credentials", async () => {
		const response = await request(app)
			.post("/login")
			.set("Content-Type", "application/json")
			.send({ email: "test@example.com" });
		expect(response.status).toBe(400);
		expect(response.body.errors).toContain("Password is required");
	});
});

describe("GET /login", () => {
	it("should return the login page", async () => {
		const response = await request(app).get("/login");
		expect(response.status).toBe(200);
	});
});
