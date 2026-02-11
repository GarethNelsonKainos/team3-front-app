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
