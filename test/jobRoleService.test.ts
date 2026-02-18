import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JobRoleResponse } from "../src/services/jobRoleService";

vi.mock("axios", () => ({
	default: {
		get: vi.fn(),
		put: vi.fn(),
	},
}));
const mockedAxios = axios as unknown as {
	get: ReturnType<typeof vi.fn>;
	put: ReturnType<typeof vi.fn>;
};
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
		const token = "test-token";
		const result = await jobRoleService.getOpenJobRoles({}, token);
		expect(mockedAxios.get).toHaveBeenCalledWith(
			`${apiBaseUrl}/api/job-roles/open`,
			{
				params: new URLSearchParams(),
				headers: { Authorization: `Bearer ${token}` },
			},
		);
		expect(result).toEqual({ roles: [], totalCount: undefined });
	});

	it("returns empty array if no token provided", async () => {
		const jobRoleService = await loadJobRoleService();
		mockedAxios.get.mockResolvedValue({
			data: [],
		});
		const result = await jobRoleService.getOpenJobRoles({});
		expect(mockedAxios.get).toHaveBeenCalledWith(
			`${apiBaseUrl}/api/job-roles/open`,
			{
				params: new URLSearchParams(),
				headers: undefined,
			},
		);
		expect(result).toEqual({ roles: [], totalCount: undefined });
	});
});

describe("getJobRoleById", () => {
	it("calls the detail endpoint and returns role data with token", async () => {
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
		const token = "test-token";
		const result = await jobRoleService.getJobRoleById(123, token);
		expect(mockedAxios.get).toHaveBeenCalledWith(
			`${apiBaseUrl}/api/job-roles/123`,
			{
				headers: { Authorization: `Bearer ${token}` },
				withCredentials: true,
			},
		);
		expect(result).toEqual(mockRole);
	});

	it("calls the detail endpoint without token", async () => {
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
			{
				headers: undefined,
				withCredentials: true,
			},
		);
		expect(result).toEqual(mockRole);
	});
});

describe("application admin methods", () => {
	it("fetches applications for a role with token", async () => {
		const jobRoleService = await loadJobRoleService();
		mockedAxios.get.mockResolvedValue({
			data: [
				{
					applicationId: 10,
					applicationStatus: "InProgress",
					email: "candidate@example.com",
					cvUrl: "https://example-bucket.s3.amazonaws.com/cv.pdf",
				},
			],
		});

		const result = await jobRoleService.getJobRoleApplications(
			99,
			"test-token",
		);

		expect(mockedAxios.get).toHaveBeenCalledWith(
			`${apiBaseUrl}/api/job-roles/99/applications`,
			{ headers: { Authorization: "Bearer test-token" } },
		);
		expect(result).toHaveLength(1);
	});

	it("calls hire endpoint", async () => {
		const jobRoleService = await loadJobRoleService();
		mockedAxios.put.mockResolvedValue({});

		await jobRoleService.hireApplication(12, "test-token");

		expect(mockedAxios.put).toHaveBeenCalledWith(
			`${apiBaseUrl}/api/applications/12/hire`,
			undefined,
			{ headers: { Authorization: "Bearer test-token" } },
		);
	});

	it("calls reject endpoint", async () => {
		const jobRoleService = await loadJobRoleService();
		mockedAxios.put.mockResolvedValue({});

		await jobRoleService.rejectApplication(13, "test-token");

		expect(mockedAxios.put).toHaveBeenCalledWith(
			`${apiBaseUrl}/api/applications/13/reject`,
			undefined,
			{ headers: { Authorization: "Bearer test-token" } },
		);
	});
});
