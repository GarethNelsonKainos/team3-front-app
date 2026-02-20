import axios from "axios";
import FormData from "form-data";
import type {
	ApplyForRoleResponse,
	UploadCvFile,
} from "../types/applicationService.js";
import type {
	JobRoleFilters,
	JobRoleListResponse,
	JobRoleResponse,
} from "../types/jobRole.js";
import type { JobRoleApplicationResponse } from "../types/jobRoleApplication.js";

const API_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS ?? 30000);

const getApiBase = (): string => {
	const apiBase = process.env.API_BASE_URL || "http://localhost:3001";
	if (!apiBase) {
		throw new Error("API_BASE_URL environment variable is not set");
	}
	return apiBase;
};

export async function getOpenJobRoles(
	filters: JobRoleFilters = {},
	token?: string,
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
	const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

	if (filters.orderBy) params.set("orderBy", filters.orderBy);
	if (filters.orderDir) params.set("orderDir", filters.orderDir);
	if (filters.limit !== undefined) params.set("limit", String(filters.limit));
	if (filters.offset !== undefined)
		params.set("offset", String(filters.offset));
	const resp = await axios.get<JobRoleResponse[]>(url, {
		params,
		headers,
		timeout: API_TIMEOUT_MS,
	});
	const totalHeader = resp.headers?.["x-total-count"];
	const totalCount = totalHeader ? Number.parseInt(totalHeader, 10) : undefined;
	return {
		roles: resp.data || [],
		totalCount: Number.isNaN(totalCount) ? undefined : totalCount,
	};
}

export async function getJobRoleById(
	jobRoleId: number | string,
	token?: string,
): Promise<JobRoleResponse | undefined> {
	const url = `${getApiBase()}/api/job-roles/${jobRoleId}`;
	const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
	try {
		const resp = await axios.get<JobRoleResponse>(url, {
			headers,
			withCredentials: true,
			timeout: API_TIMEOUT_MS,
		});
		return resp.data;
	} catch (err: unknown) {
		const axiosErr = err as { response?: { status?: number } };
		if (axiosErr.response && axiosErr.response.status === 404) {
			return undefined;
		}
		throw err;
	}
}

export async function getJobRoleApplications(
	jobRoleId: number | string,
	token?: string,
): Promise<JobRoleApplicationResponse[]> {
	const url = `${getApiBase()}/api/job-roles/${jobRoleId}/applications`;
	const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
	const resp = await axios.get<JobRoleApplicationResponse[]>(url, {
		headers,
		timeout: API_TIMEOUT_MS,
	});
	return resp.data || [];
}

export async function hireApplication(
	applicationId: number | string,
	token?: string,
): Promise<void> {
	const url = `${getApiBase()}/api/applications/${applicationId}/hire`;
	const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
	await axios.put(url, undefined, { headers, timeout: API_TIMEOUT_MS });
}

export async function rejectApplication(
	applicationId: number | string,
	token?: string,
): Promise<void> {
	const url = `${getApiBase()}/api/applications/${applicationId}/reject`;
	const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
	await axios.put(url, undefined, { headers, timeout: API_TIMEOUT_MS });
}

export async function applyForJobRole(
	jobRoleId: number | string,
	cvFile: UploadCvFile,
	token?: string,
): Promise<ApplyForRoleResponse> {
	const url = `${getApiBase()}/api/job-roles/${jobRoleId}/apply`;
	const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
	const formData = new FormData();
	formData.append("cv", cvFile.buffer, {
		filename: cvFile.originalname,
		contentType: cvFile.mimetype,
		knownLength: cvFile.buffer.length,
	});
	const formHeaders = formData.getHeaders();
	const combinedHeaders = { ...(headers ?? {}), ...formHeaders };
	const resp = await axios.post<ApplyForRoleResponse>(url, formData, {
		headers: combinedHeaders,
		timeout: API_TIMEOUT_MS,
		maxBodyLength: Number.POSITIVE_INFINITY,
	});
	return resp.data;
}

export default {
	getOpenJobRoles,
	getJobRoleById,
	getJobRoleApplications,
	hireApplication,
	rejectApplication,
	applyForJobRole,
};
