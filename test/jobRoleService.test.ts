import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JobRoleResponse } from "../src/services/jobRoleService";

vi.mock("axios", () => ({
	default: {
		get: vi.fn(),
	},
}));
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };
const apiBaseUrl = "http://example.test";

const loadJobRoleService = async () => {
	vi.resetModules();
	const module = await import("../src/services/jobRoleService");
	return module.default;
};

beforeEach(() => {
	process.env.API_BASE_URL = apiBaseUrl;
});

afterEach(() => {
	vi.clearAllMocks();
	delete process.env.API_BASE_URL;
});

describe("getOpenJobRoles", () => {
	it("returns empty array if no open roles", async () => {
		const jobRoleService = await loadJobRoleService();
		mockedAxios.get.mockResolvedValue({
			data: [],
		});
		const result = await jobRoleService.getOpenJobRoles();
		expect(mockedAxios.get).toHaveBeenCalledWith(
			`${apiBaseUrl}/api/job-roles/open`,
			{ params: new URLSearchParams(), headers: {} },
		);
		expect(result).toEqual([]);
	});

	it("passes token in Authorization header when provided", async () => {
		const jobRoleService = await loadJobRoleService();
		const token = "test-token-123";
		mockedAxios.get.mockResolvedValue({
			data: [],
		});
		const result = await jobRoleService.getOpenJobRoles({}, token);
		expect(mockedAxios.get).toHaveBeenCalledWith(
			`${apiBaseUrl}/api/job-roles/open`,
			{
				params: new URLSearchParams(),
				headers: { Authorization: `Bearer ${token}` },
			},
		);
		expect(result).toEqual([]);
	});
});

describe("getJobRoleById", () => {
	it("calls the detail endpoint and returns role data", async () => {
		const jobRoleService = await loadJobRoleService();
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
			`${apiBaseUrl}/api/job-roles/123`,
			{ headers: {} },
		);
		expect(result).toEqual(mockRole);
	});

	it("passes token in Authorization header when provided", async () => {
		const jobRoleService = await loadJobRoleService();
		const token = "test-token-456";
		const mockRole: JobRoleResponse = {
			jobRoleId: 2,
			roleName: "QA Engineer",
			location: "Dublin",
			closingDate: "2030-02-15",
			responsibilities: "Test software",
			sharepointUrl: "http://example.com/job-role/2",
			numberOfOpenPositions: 2,
			capability: {
				capabilityId: 11,
				capabilityName: "QA",
			},
			band: {
				bandId: 3,
				bandName: "Senior",
			},
			status: {
				statusId: 1,
				statusName: "Open",
			},
		};

		mockedAxios.get.mockResolvedValue({ data: mockRole });
		const result = await jobRoleService.getJobRoleById(456, token);
		expect(mockedAxios.get).toHaveBeenCalledWith(
			`${apiBaseUrl}/api/job-roles/456`,
			{ headers: { Authorization: `Bearer ${token}` } },
		);
		expect(result).toEqual(mockRole);
	});

	it("returns undefined for 404 errors", async () => {
		const jobRoleService = await loadJobRoleService();
		const error = new Error("Not found");
		(error as any).response = { status: 404 };
		mockedAxios.get.mockRejectedValue(error);
		const result = await jobRoleService.getJobRoleById(999);
		expect(result).toBeUndefined();
	});
});
