import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, validateLogin } from "../src/index";

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

describe("validateLogin", () => {
	describe("valid inputs", () => {
		it("should return valid true with email and password", () => {
			const result = validateLogin("test@example.com", "password123");
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should return valid true with any email format", () => {
			const result = validateLogin("user+tag@domain.co.uk", "pass");
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should return valid true with any password", () => {
			const result = validateLogin("email@test.com", "!@#$%^&*()");
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});
	});

	describe("invalid inputs", () => {
		it("should return invalid with missing email", () => {
			const result = validateLogin(undefined, "password123");
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Email is required");
		});

		it("should return invalid with empty email", () => {
			const result = validateLogin("", "password123");
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Email is required");
		});

		it("should return invalid with missing password", () => {
			const result = validateLogin("test@example.com", undefined);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Password is required");
		});

		it("should return invalid with empty password", () => {
			const result = validateLogin("test@example.com", "");
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Password is required");
		});

		it("should return invalid with both missing", () => {
			const result = validateLogin(undefined, undefined);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Email is required");
			expect(result.errors).toContain("Password is required");
			expect(result.errors).toHaveLength(2);
		});

		it("should return invalid with both empty", () => {
			const result = validateLogin("", "");
			expect(result.valid).toBe(false);
			expect(result.errors).toHaveLength(2);
		});
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
