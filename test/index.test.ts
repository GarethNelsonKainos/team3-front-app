import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/index";

describe("Express Server", () => {
	it("should create an express app", () => {
		const app = express();
		expect(app).toBeDefined();
	});

	it("should have get method", () => {
		const app = express();
		expect(app.get).toBeDefined();
		expect(typeof app.get).toBe("function");
	});

	it("should have listen method", () => {
		const app = express();
		expect(app.listen).toBeDefined();
		expect(typeof app.listen).toBe("function");
	});
});

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
