import axios from "axios";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";

export async function login(email: string, password: string): Promise<string> {
	const resp = await axios.post<{ token: string }>(`${API_BASE}/api/login`, {
		email,
		password,
	});
	return resp.data.token;
}

export default { login };
