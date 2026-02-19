import axios from "axios";
import type FormData from "form-data";

const API_BACKEND_URL = process.env.API_BASE_URL || "http://localhost:3001";
if (!API_BACKEND_URL) {
	throw new Error("API_BASE_URL environment variable is not set");
}

export async function uploadCV(id: string, formData: FormData, token?: string) {
	const apiUrl = `${API_BACKEND_URL}/api/job-roles/${id}/apply`;
	await axios.post(apiUrl, formData, {
		headers: {
			...formData.getHeaders(),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	});
}
