import axios from "axios";

export interface JobRoleResponse {
	jobRoleId: number;
	roleName: string;
	location: string;
	closingDate: string;
	responsibilities: string;
	sharepointUrl: string;
	numberOfOpenPositions: number;
	capability: {
		capabilityId: number;
		capabilityName: string;
	};
	band: {
		bandId: number;
		bandName: string;
	};
	status: {
		statusId: number;
		statusName: string;
	};
}

export interface JobRoleFilters {
	roleName?: string;
	location?: string;
	closingDate?: string;
	capability?: string[];
	band?: string[];
	orderBy?: string;
	orderDir?: "asc" | "desc";
	limit?: number;
	offset?: number;
}

export interface JobRoleListResponse {
	roles: JobRoleResponse[];
	totalCount?: number;
}

const getApiBase = (): string => {
	const apiBase = process.env.API_BASE_URL || "http://localhost:3001";
	if (!apiBase) {
		throw new Error("API_BASE_URL environment variable is not set");
	}
	return apiBase;
};

export async function getOpenJobRoles(
	filters: JobRoleFilters = {},
): Promise<JobRoleListResponse> {
	const url = `${getApiBase()}/api/job-roles/open`;
	const params = new URLSearchParams();
	if (filters.roleName) params.set("roleName", filters.roleName);
	if (filters.location) params.set("location", filters.location);
	if (filters.closingDate) params.set("closingDate", filters.closingDate);
	if (filters.capability) {
		for (const value of filters.capability) {
			params.append("capability", value);
		}
	}
	if (filters.band) {
		for (const value of filters.band) {
			params.append("band", value);
		}
	}
	if (filters.orderBy) params.set("orderBy", filters.orderBy);
	if (filters.orderDir) params.set("orderDir", filters.orderDir);
	if (filters.limit) params.set("limit", String(filters.limit));
	if (filters.offset) params.set("offset", String(filters.offset));
	const resp = await axios.get<JobRoleResponse[]>(url, { params });
	const totalHeader = resp.headers?.["x-total-count"];
	const totalCount = totalHeader ? Number.parseInt(totalHeader, 10) : undefined;
	return {
		roles: resp.data || [],
		totalCount: Number.isNaN(totalCount) ? undefined : totalCount,
	};
}

export async function getJobRoleById(
	jobRoleId: number | string,
): Promise<JobRoleResponse | undefined> {
	const url = `${getApiBase()}/api/job-roles/${jobRoleId}`;
	try {
		const resp = await axios.get<JobRoleResponse>(url);
		return resp.data;
	} catch (err: unknown) {
		const axiosErr = err as { response?: { status?: number } };
		if (axiosErr.response && axiosErr.response.status === 404) {
			return undefined;
		}
		throw err;
	}
}

export default { getOpenJobRoles, getJobRoleById };
