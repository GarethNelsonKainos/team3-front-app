import { describe, expect, it } from "vitest";
import { validateLogin } from "../../src/utils/login";

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
