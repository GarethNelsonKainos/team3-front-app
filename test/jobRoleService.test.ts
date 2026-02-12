import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import jobRoleService, {
	type JobRoleResponse,
} from "../src/services/jobRoleService";

vi.mock("axios", () => ({
	default: {
		get: vi.fn(),
	},
}));
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

describe("getOpenJobRoles", () => {
	it("returns empty array if no open roles", async () => {
		mockedAxios.get.mockResolvedValue({
			data: [],
		});
		const result = await jobRoleService.getOpenJobRoles();
		expect(result).toEqual([]);
	});
});

describe("getJobRoleById", () => {
	it("calls the detail endpoint and returns role data", async () => {
		const mockRole: JobRoleResponse = {
			jobRoleId: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			closingDate: "2030-01-15",
			responsibilities: "Develop software solutions",
			sharepointUrl: "http://example.com/job-role/1",
			numberOfOpenPositions: 3,
			capability: {
				capabilityId: 10,
				capabilityName: "Engineering",
			},
			band: {
				bandId: 2,
				bandName: "Associate",
			},
			status: {
				statusId: 1,
				statusName: "Open",
			},
		};

		mockedAxios.get.mockResolvedValue({ data: mockRole });
		const result = await jobRoleService.getJobRoleById(123);
		expect(mockedAxios.get).toHaveBeenCalledWith(
			"http://localhost:3001/api/job-roles/123",
		);
		expect(result).toEqual(mockRole);
	});
});
