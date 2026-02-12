import axios from "axios";

export interface JobRoleResponse {
	jobRoleId?: number;
	roleName: string;
	location?: string;
	capability?: string;
	band?: string;
	closingDate?: string;
	status?: string;
}

export interface JobRoleDetailedResponse {
	jobRoleId: number;
	roleName: string;
	description?: string;
	responsibilities?: string;
	sharepointUrl?: string;
	location?: string;
	capability?: string;
	band?: string;
	closingDate?: string;
	status?: string;
	numberOfOpenPositions?: number;
}

const API_BASE = process.env.API_BASE_URL || "http://localhost:4000";

export async function getOpenJobRoles(): Promise<JobRoleResponse[]> {
	const url = `${API_BASE}/api/job-roles`;
	const resp = await axios.get<JobRoleResponse[]>(url);
	const data = resp.data || [];
	return data.filter(
		(r: JobRoleResponse) => (r.status || "").toLowerCase() === "open",
	);
}

export async function getJobRoleById(
	jobRoleId: number | string,
): Promise<JobRoleDetailedResponse | undefined> {
	const url = `${API_BASE}/api/job-roles/${jobRoleId}`;
	try {
		const resp = await axios.get<JobRoleDetailedResponse>(url);
		return resp.data;
	} catch (err: any) {
		if (err.response && err.response.status === 404) {
			return undefined;
		}
		throw err;
	}
}

export default { getOpenJobRoles, getJobRoleById };
