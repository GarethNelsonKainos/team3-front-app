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

const API_BASE = process.env.API_BASE_URL || "http://localhost:4000";

export async function getOpenJobRoles(): Promise<JobRoleResponse[]> {
  const url = `${API_BASE}/api/job-roles`;
  const resp = await axios.get<JobRoleResponse[]>(url);
  const data = resp.data || [];
  return data.filter((r) => (r.status || "").toLowerCase() === "open");
}

export default { getOpenJobRoles };
