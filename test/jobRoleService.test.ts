import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import jobRoleService, {
	type JobRoleDetailedResponse,
	type JobRoleResponse, 
} from "../src/services/jobRoleService";

vi.mock("axios", () => ({
	default: {
		get: vi.fn(),
	},
}));
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

describe("getOpenJobRoles", () => {
	it("returns only open job roles", async () => {
		const mockData: JobRoleResponse[] = [
			{ roleName: "Dev", status: "open" },
			{ roleName: "QA", status: "closed" },
			{ roleName: "PM", status: "OPEN" },
		];
		mockedAxios.get.mockResolvedValue({ data: mockData });
		const result = await jobRoleService.getOpenJobRoles();
		expect(result).toEqual([
			{ roleName: "Dev", status: "open" },
			{ roleName: "PM", status: "OPEN" },
		]);
	});

	it("returns empty array if no open roles", async () => {
		mockedAxios.get.mockResolvedValue({
			data: [{ roleName: "QA", status: "closed" }],
		});
		const result = await jobRoleService.getOpenJobRoles();
		expect(result).toEqual([]);
	});
});

describe("getJobRoleById", () => {
	it("calls the detail endpoint and returns role data", async () => {
		const mockRole: JobRoleDetailedResponse = {
			jobRoleId: 123,
			roleName: "Dev",
			description: "Build things",
			responsibilities: "Ship features",
			sharepointUrl: "https://sharepoint.example/job-specs/123",
			location: "Belfast",
			capability: "Engineering",
			band: "SSE",
			closingDate: "2026-03-01",
			status: "open",
			numberOfOpenPositions: 2,
		};

		mockedAxios.get.mockResolvedValue({ data: mockRole });
		const result = await jobRoleService.getJobRoleById(123);
		expect(mockedAxios.get).toHaveBeenCalledWith(
			"http://localhost:4000/api/job-roles/123",
		);
		expect(result).toEqual(mockRole);
	});
});
