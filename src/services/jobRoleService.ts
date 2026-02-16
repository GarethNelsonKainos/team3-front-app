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

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";

export async function getOpenJobRoles(): Promise<JobRoleResponse[]> {
	const url = `${API_BASE}/api/job-roles/open`;
	const resp = await axios.get<JobRoleResponse[]>(url);
	return resp.data || [];
}

export async function getJobRoleById(
	jobRoleId: number | string,
): Promise<JobRoleResponse | undefined> {
	const url = `${API_BASE}/api/job-roles/${jobRoleId}`;
	try {
		const resp = await axios.get<JobRoleResponse>(url);
		return resp.data;
	} catch (err: any ) {
		if (err.response && err.response.status === 404) {
			return undefined;
		}
		throw err;
	}
}

export default { getOpenJobRoles, getJobRoleById };
