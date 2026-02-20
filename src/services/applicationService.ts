import axios from "axios";

export async function getCvDownloadUrl(
	applicationId: string,
	token: string,
): Promise<string> {
	const backendUrl = `${process.env.API_BASE_URL || "http://localhost:3001"}/api/applications/cv?applicationId=${encodeURIComponent(applicationId)}`;
	const response = await axios.get(backendUrl, {
		headers: { Authorization: `Bearer ${token}` },
		maxRedirects: 0,
		validateStatus: (status: number) => status === 302,
	});
	const location = response.headers["location"];
	if (!location) throw new Error("No CV download URL returned");
	return location;
}
