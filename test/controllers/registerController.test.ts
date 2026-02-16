import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../src/index";
import authService from "../../src/services/authService";

vi.mock("../../src/services/authService");

describe("POST /register", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should handle valid registration credentials", async () => {
		vi.mocked(authService.register).mockResolvedValue();

		const response = await request(app)
			.post("/register")
			.type("form")
			.send({ email: "newuser@example.com", password: "password123" });

		expect(response.status).toBe(302);
		expect(response.header.location).toBe("/login");
		expect(authService.register).toHaveBeenCalledWith(
			"newuser@example.com",
			"password123",
		);
	});

	it("should return error with missing email", async () => {
		const response = await request(app)
			.post("/register")
			.type("form")
			.send({ password: "password123" }); // Missing email

		expect(response.status).toBe(400);
		expect(response.text).toContain(
			"Please provide a valid email and password.",
		);
		expect(authService.register).not.toHaveBeenCalled();
	});

	it("should return error with missing password", async () => {
		const response = await request(app)
			.post("/register")
			.type("form")
			.send({ email: "user@example.com" }); // Missing password

		expect(response.status).toBe(400);
		expect(response.text).toContain(
			"Please provide a valid email and password.",
		);
		expect(authService.register).not.toHaveBeenCalled();
	});

	it("should return error with missing both email and password", async () => {
		const response = await request(app)
			.post("/register")
			.type("form")
			.send({}); // Missing both

		expect(response.status).toBe(400);
		expect(response.text).toContain(
			"Please provide a valid email and password.",
		);
		expect(authService.register).not.toHaveBeenCalled();
	});

	it("should return error with empty email", async () => {
		const response = await request(app)
			.post("/register")
			.type("form")
			.send({ email: "", password: "password123" });

		expect(response.status).toBe(400);
		expect(response.text).toContain(
			"Please provide a valid email and password.",
		);
		expect(authService.register).not.toHaveBeenCalled();
	});

	it("should return error with empty password", async () => {
		const response = await request(app)
			.post("/register")
			.type("form")
			.send({ email: "user@example.com", password: "" });

		expect(response.status).toBe(400);
		expect(response.text).toContain(
			"Please provide a valid email and password.",
		);
		expect(authService.register).not.toHaveBeenCalled();
	});

	it("should return error when registration service fails", async () => {
		vi.mocked(authService.register).mockRejectedValue(
			new Error("Registration error"),
		);

		const response = await request(app)
			.post("/register")
			.type("form")
			.send({ email: "existing@example.com", password: "password123" });

		expect(response.status).toBe(400);
		expect(response.text).toContain("Registration failed. Please try again.");
		expect(authService.register).toHaveBeenCalledWith(
			"existing@example.com",
			"password123",
		);
	});

	it("should preserve email in form when validation fails", async () => {
		const response = await request(app)
			.post("/register")
			.type("form")
			.send({ email: "user@example.com" }); // Missing password

		expect(response.status).toBe(400);
		expect(response.text).toContain("user@example.com");
	});

	it("should preserve email in form when registration fails", async () => {
		vi.mocked(authService.register).mockRejectedValue(
			new Error("Service error"),
		);

		const response = await request(app)
			.post("/register")
			.type("form")
			.send({ email: "test@example.com", password: "password123" });

		expect(response.status).toBe(400);
		expect(response.text).toContain("test@example.com");
	});
});

describe("GET /register", () => {
	it("should return the registration page", async () => {
		const response = await request(app).get("/register");
		
		expect(response.status).toBe(200);
		expect(response.text).toBeTruthy();
	});
});
