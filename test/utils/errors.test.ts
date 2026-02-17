import { describe, expect, it } from "vitest";
import { ConflictError, ValidationError } from "../../src/utils/errors";

describe("Custom Errors", () => {
	describe("ValidationError", () => {
		it("should create a ValidationError with message", () => {
			const error = new ValidationError("Invalid input");
			expect(error.message).toBe("Invalid input");
			expect(error.name).toBe("ValidationError");
		});

		it("should be an instance of Error", () => {
			const error = new ValidationError("Test error");
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(ValidationError);
		});
	});

	describe("ConflictError", () => {
		it("should create a ConflictError with message", () => {
			const error = new ConflictError("Email already exists");
			expect(error.message).toBe("Email already exists");
			expect(error.name).toBe("ConflictError");
		});

		it("should be an instance of Error", () => {
			const error = new ConflictError("Test error");
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(ConflictError);
		});
	});
});
