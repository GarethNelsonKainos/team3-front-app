import axios from "axios";
import type FormData from "form-data";

const backendUrl = process.env.API_URL || "http://localhost:3001";
if (!backendUrl) {
    throw new Error("API_URL environment variable is not set");
}

export async function uploadCV(id: string, formData: FormData, token?: string) {
    const apiUrl = `${backendUrl}/job-roles/${id}/apply`;
    await axios.post(apiUrl, formData, {
		headers: {
			...formData.getHeaders(),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	});
}