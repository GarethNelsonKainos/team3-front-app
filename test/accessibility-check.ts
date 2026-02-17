import pa11y from "pa11y";

const urls = [
	"http://localhost:3000/", // Home page
	"http://localhost:3000/login", // Login page
	"http://localhost:3000/register", // Register page
	"http://localhost:3000/job-role-list", // Job Role List
	"http://localhost:3000/job-role-information", // Job Role Information
	"http://localhost:3000/job-role-apply", // Job Role Apply
	"http://localhost:3000/job-applications", // Job Applications
];

async function runAccessibilityTests() {
	for (const url of urls) {
		const results = await pa11y(url);
		console.log(`Accessibility results for ${url}:`);
		if (results.issues.length === 0) {
			console.log("- No accessibility issues found.");
		} else {
			results.issues.forEach((issue, idx) => {
				console.log(`Issue #${idx + 1}:`);
				console.log(`  Type:      ${issue.type} (code: ${issue.typeCode})`);
				console.log(`  Message:   ${issue.message}`);
				console.log(`  Rule:      ${issue.code}`);
				console.log(`  Selector:  ${issue.selector}`);
				console.log(`  Context:   ${issue.context}`);
				console.log("");
			});
		}
		console.log("");
	}
}

runAccessibilityTests();
