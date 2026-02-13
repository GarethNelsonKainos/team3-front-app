import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { app } from "../../src/index";
import authService from "../../src/services/authService";

vi.mock("../../src/services/authService");

describe("POST /login", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should handle valid login credentials", async () => {
		vi.mocked(authService.login).mockResolvedValue("mock-token");

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "test@example.com", password: "password123" });

		expect(response.status).toBe(302);
		expect(response.header.location).toBe("/job-roles");
		expect(response.headers["set-cookie"]).toBeDefined();
	});

	it("should return error with missing credentials", async () => {
		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "test@example.com" }); // Missing password

		expect(response.status).toBe(200);
		expect(response.text).toContain("Please provide a valid email and password.");
	});

	it("should return error with invalid credentials", async () => {
		vi.mocked(authService.login).mockRejectedValue({
			response: { status: 401 },
		});

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "wrong@example.com", password: "wrong" });

		expect(response.status).toBe(200);
		expect(response.text).toContain("Invalid email or password.");
	});
});

describe("GET /login", () => {
	it("should return the login page", async () => {
		const response = await request(app).get("/login");
		expect(response.status).toBe(200);
	});
});

describe("POST /logout", () => {
	it("should clear the token cookie and redirect to home", async () => {
		const response = await request(app)
			.post("/logout")
			.set("Cookie", ["token=fake-token"]);

		expect(response.status).toBe(302);
		expect(response.header.location).toBe("/");
		const setCookieHeader = response.headers["set-cookie"];
		const setCookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
		const setCookie = setCookies.find((c: string) => c && c.startsWith("token="));
		expect(setCookie).toBeDefined();
		expect(setCookie).toMatch(/token=;/);
	});

	it("should redirect to home even if no token cookie is present", async () => {
		const response = await request(app)
			.post("/logout");

		expect(response.status).toBe(302);
		expect(response.header.location).toBe("/");
	});
});
