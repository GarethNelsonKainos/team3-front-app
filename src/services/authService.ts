import axios from "axios";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";
const API_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS ?? 30000);

if (!API_BASE) {
	throw new Error("API_BASE_URL environment variable is not set");
}

export async function login(email: string, password: string): Promise<string> {
	const resp = await axios.post<{ token: string }>(
		`${API_BASE}/api/login`,
		{
			email,
			password,
		},
		{
			timeout: API_TIMEOUT_MS,
		},
	);
	return resp.data.token;
}

export async function register(email: string, password: string): Promise<void> {
	await axios.post(
		`${API_BASE}/api/register`,
		{
			email,
			password,
		},
		{
			timeout: API_TIMEOUT_MS,
		},
	);
}

export default { login, register };
