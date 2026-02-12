export function validateLogin(
	email?: string,
	password?: string,
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	if (!email) errors.push("Email is required");
	if (!password) errors.push("Password is required");
	return { valid: errors.length === 0, errors };
}
