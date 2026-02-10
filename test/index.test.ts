import { describe, it, expect } from "vitest";
import express from "express";

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
