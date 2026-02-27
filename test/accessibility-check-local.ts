import fs from "node:fs/promises";
import path from "node:path";
import pa11y from "pa11y";
import puppeteer from "puppeteer";

const urls = [
	"http://localhost:3000/", // Home page
	"http://localhost:3000/login", // Login page
	"http://localhost:3000/register", // Register page
	"http://localhost:3000/job-role-list", // Job Role List
	"http://localhost:3000/job-role-information", // Job Role Information
	"http://localhost:3000/job-role-apply", // Job Role Apply
];
if (process.env.FEATURE_JOB_APPLICATIONS === "true") {
	urls.push("http://localhost:3000/job-applications"); // Job Applications
}

const STANDARD = "WCAG2AAA";
const reportDir = path.resolve("test-results", "accessibility");

type PageResult = {
	url: string;
	issues: Awaited<ReturnType<typeof pa11y>>["issues"];
};

function getTimestamp(): string {
	return new Date().toISOString().replaceAll(":", "-");
}

function buildMarkdownReport(pageResults: PageResult[], runAt: string): string {
	const totalIssues = pageResults.reduce(
		(sum, page) => sum + page.issues.length,
		0,
	);
	const totalPages = pageResults.length;
	const passedPages = pageResults.filter(
		(page) => page.issues.length === 0,
	).length;

	const issueTypeCounts = pageResults
		.flatMap((page) => page.issues)
		.reduce(
			(acc, issue) => {
				acc[issue.type] = (acc[issue.type] ?? 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

	const lines: string[] = [];
	lines.push("# Accessibility Report (Pa11y)");
	lines.push("");
	lines.push("## Executive Summary");
	lines.push(`- Date: ${runAt}`);
	lines.push(`- Standard tested: ${STANDARD}`);
	lines.push(`- Pages tested: ${totalPages}`);
	lines.push(`- Pages with no issues: ${passedPages}`);
	lines.push(`- Total issues found: ${totalIssues}`);
	lines.push("");
	lines.push("## Scope");
	lines.push("- Tool: Pa11y (HTML CodeSniffer runner)");
	lines.push(
		"- Validation standard: WCAG 2.0 AAA (includes A + AA + AAA criteria)",
	);
	lines.push("- Browser engine: Chromium (via Puppeteer)");
	lines.push("- Pages tested:");
	for (const url of pageResults.map((page) => page.url)) {
		lines.push(`  - ${url}`);
	}
	lines.push("");
	lines.push("## What Is Checked");
	lines.push(
		"Pa11y checks page markup and rendered output against WCAG rules, including:",
	);
	lines.push(
		"- Text alternatives for non-text content (e.g. image `alt` text)",
	);
	lines.push("- Form labeling and accessible names");
	lines.push("- Heading structure and document semantics");
	lines.push("- Link purpose and descriptive text");
	lines.push("- Colour contrast and visual presentation rules");
	lines.push("- ARIA usage and compatibility checks");
	lines.push(
		"- General parsing/structure issues that affect assistive technology",
	);
	lines.push("");
	lines.push("## Issue Breakdown");
	if (totalIssues === 0) {
		lines.push("- No issues detected by automated checks.");
	} else {
		for (const [type, count] of Object.entries(issueTypeCounts)) {
			lines.push(`- ${type}: ${count}`);
		}
	}
	lines.push("");
	lines.push("## Detailed Findings");
	for (const page of pageResults) {
		lines.push("");
		lines.push(`### ${page.url}`);
		if (page.issues.length === 0) {
			lines.push("- No issues found on this page.");
			continue;
		}

		for (const [index, issue] of page.issues.entries()) {
			lines.push(
				`- ${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}`,
			);
			lines.push(`  - Rule: ${issue.code}`);
			lines.push(`  - Selector: ${issue.selector}`);
			lines.push(`  - Context: ${issue.context}`);
		}
	}
	lines.push("");
	lines.push("## Notes for Demonstration");
	lines.push("- This report shows automated accessibility checks only.");
	lines.push(
		"- Manual checks are still recommended for keyboard-only flows and screen reader UX.",
	);

	return `${lines.join("\n")}\n`;
}

function buildDemoSummaryReport(
	pageResults: PageResult[],
	runAt: string,
): string {
	const totalIssues = pageResults.reduce(
		(sum, page) => sum + page.issues.length,
		0,
	);
	const totalPages = pageResults.length;
	const pagesWithIssues = pageResults.filter(
		(page) => page.issues.length > 0,
	).length;

	const byPage = pageResults
		.map((page) => ({ url: page.url, count: page.issues.length }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 3);

	const byRule = pageResults
		.flatMap((page) => page.issues)
		.reduce(
			(acc, issue) => {
				acc[issue.code] = (acc[issue.code] ?? 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

	const topRules = Object.entries(byRule)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	const lines: string[] = [];
	lines.push("# Accessibility Demo Summary");
	lines.push("");
	lines.push("## Snapshot");
	lines.push(`- Run date: ${runAt}`);
	lines.push(`- Standard: ${STANDARD}`);
	lines.push(`- Pages tested: ${totalPages}`);
	lines.push(`- Pages with issues: ${pagesWithIssues}`);
	lines.push(`- Total issues: ${totalIssues}`);
	lines.push("");
	lines.push("## What Was Tested");
	lines.push("- Automated WCAG checks using Pa11y + HTML CodeSniffer");
	lines.push("- Rendering and structure checks in Chromium via Puppeteer");
	lines.push("- Rule coverage includes A, AA, and AAA criteria");
	lines.push("");
	lines.push("## Top 3 Pages by Issue Count");
	if (byPage.length === 0) {
		lines.push("- No pages were scanned.");
	} else {
		for (const page of byPage) {
			lines.push(`- ${page.url}: ${page.count}`);
		}
	}
	lines.push("");
	lines.push("## Top 5 Failing Rules");
	if (topRules.length === 0) {
		lines.push("- No rule failures detected.");
	} else {
		for (const [rule, count] of topRules) {
			lines.push(`- ${rule}: ${count}`);
		}
	}
	lines.push("");
	lines.push("## Demo Notes");
	lines.push(
		"- This is an automated accessibility snapshot, not a full manual audit.",
	);
	lines.push(
		"- Use this summary slide with the full report for detailed examples/selectors.",
	);

	return `${lines.join("\n")}\n`;
}

async function writeReports(pageResults: PageResult[]) {
	await fs.mkdir(reportDir, { recursive: true });

	const runAt = new Date().toISOString();
	const timestamp = getTimestamp();

	const reportData = {
		runAt,
		standard: STANDARD,
		pagesTested: pageResults.length,
		totalIssues: pageResults.reduce((sum, page) => sum + page.issues.length, 0),
		results: pageResults,
	};

	const jsonReportPath = path.join(reportDir, `pa11y-report-${timestamp}.json`);
	const markdownReportPath = path.join(
		reportDir,
		`pa11y-report-${timestamp}.md`,
	);
	const demoSummaryPath = path.join(
		reportDir,
		`pa11y-demo-summary-${timestamp}.md`,
	);
	const latestJsonPath = path.join(reportDir, "pa11y-report-latest.json");
	const latestMarkdownPath = path.join(reportDir, "pa11y-report-latest.md");
	const latestDemoSummaryPath = path.join(
		reportDir,
		"pa11y-demo-summary-latest.md",
	);

	const markdown = buildMarkdownReport(pageResults, runAt);
	const demoSummary = buildDemoSummaryReport(pageResults, runAt);

	await Promise.all([
		fs.writeFile(jsonReportPath, JSON.stringify(reportData, null, 2), "utf8"),
		fs.writeFile(markdownReportPath, markdown, "utf8"),
		fs.writeFile(demoSummaryPath, demoSummary, "utf8"),
		fs.writeFile(latestJsonPath, JSON.stringify(reportData, null, 2), "utf8"),
		fs.writeFile(latestMarkdownPath, markdown, "utf8"),
		fs.writeFile(latestDemoSummaryPath, demoSummary, "utf8"),
	]);

	console.log("Accessibility report files generated:");
	console.log(`- ${jsonReportPath}`);
	console.log(`- ${markdownReportPath}`);
	console.log(`- ${demoSummaryPath}`);
	console.log(`- ${latestJsonPath}`);
	console.log(`- ${latestMarkdownPath}`);
	console.log(`- ${latestDemoSummaryPath}`);
}

async function runAccessibilityTests() {
	const launchArgs = process.env.CI
		? ["--no-sandbox", "--disable-setuid-sandbox"] // needed for GitHub Actions CI environment
		: [];
	const browser = await puppeteer.launch({ args: launchArgs });
	const pageResults: PageResult[] = [];

	try {
		for (const url of urls) {
			const results = await pa11y(url, {
				browser,
				standard: STANDARD,
				includeWarnings: true,
				includeNotices: true,
			});
			pageResults.push({ url, issues: results.issues });

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

		await writeReports(pageResults);
	} catch (error) {
		console.error("Error running accessibility tests: ", error);
		process.exitCode = 1;
	} finally {
		await browser.close();
	}

	const totalIssues = pageResults.reduce(
		(sum, page) => sum + page.issues.length,
		0,
	);
	if (totalIssues > 0) {
		process.exitCode = 1;
	}
}

runAccessibilityTests();
