import axios from "axios";

export async function getCvDownloadUrl(
	applicationId: string,
	token: string,
): Promise<string> {
	const backendUrl = `${process.env.API_BASE_URL || "http://localhost:3001"}/api/applications/cv?applicationId=${encodeURIComponent(
		applicationId,
	)}`;
	// Allow 2xx-3xx so we can handle either a JSON body containing the URL
	// or a redirect with Location header.
	const response = await axios.get(backendUrl, {
		headers: { Authorization: `Bearer ${token}` },
		maxRedirects: 0,
		validateStatus: (status: number) => status >= 200 && status < 400,
	});

	// Prefer Location header if present (redirect response)
	const location = response.headers["location"] as string | undefined;
	if (location) return location;

	// Otherwise, try to read common JSON shapes: { url } or { location }
	const data = response.data as unknown;
	if (data && typeof data === "object") {
		const d = data as Record<string, unknown>;
		if (typeof d.url === "string") return d.url;
		if (typeof d.location === "string") return d.location;
	}

	throw new Error("No CV download URL returned");
}
