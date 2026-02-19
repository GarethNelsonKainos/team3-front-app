import { describe, expect, it } from "vitest";
import { cvFileFilter } from "../../src/utils/upload";

describe("Upload CV", () => {
	it("should allow PDF, DOC, and DOCX files", () => {
		const validFiles = [
			{ originalname: "resume.pdf", mimetype: "application/pdf" },
			{ originalname: "resume.doc", mimetype: "application/msword" },
			{
				originalname: "resume.docx",
				mimetype:
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			},
		];

		validFiles.forEach((uploadFile) => {
			const cb = (err: Error | null, accept?: boolean) => {
				expect(err).toBeNull();
				expect(accept).toBe(true);
			};

			cvFileFilter({} as any, uploadFile as any, cb);
		});
	});

	it("should reject invalid file types", () => {
		const invalidFiles = [
			{ originalname: "image.png", mimetype: "image/png" },
			{ originalname: "script.js", mimetype: "application/javascript" },
			{ originalname: "archive.zip", mimetype: "application/zip" },
		];

		invalidFiles.forEach((uploadFile) => {
			const cb = (err: Error | null, accept?: boolean) => {
				expect(err).toBeInstanceOf(Error);
				expect(err?.message).toBe("Only PDF, DOC, and DOCX files are allowed.");
				expect(accept).toBeUndefined();
			};

			cvFileFilter({} as any, uploadFile as any, cb);
		});
	});

	it("should reject files with valid mimetype but invalid extension", () => {
		const invalidFiles = [
			{ originalname: "resume.exe", mimetype: "application/pdf" },
			{ originalname: "resume.txt", mimetype: "application/msword" },
		];

		invalidFiles.forEach((uploadFile) => {
			const cb = (err: Error | null, accept?: boolean) => {
				expect(err).toBeInstanceOf(Error);
				expect(err?.message).toBe("Only PDF, DOC, and DOCX files are allowed.");
				expect(accept).toBeUndefined();
			};

			cvFileFilter({} as any, uploadFile as any, cb);
		});
	});

	it("should reject files with valid extension but invalid mimetype", () => {
		const invalidFiles = [
			{ originalname: "resume.pdf", mimetype: "application/msword" },
			{ originalname: "resume.doc", mimetype: "application/pdf" },
		];

		invalidFiles.forEach((uploadFile) => {
			const cb = (err: Error | null, accept?: boolean) => {
				expect(err).toBeInstanceOf(Error);
				expect(err?.message).toBe("Only PDF, DOC, and DOCX files are allowed.");
				expect(accept).toBeUndefined();
			};

			cvFileFilter({} as any, uploadFile as any, cb);
		});
	});

	it("should reject files without an extension", () => {
		const invalidFile = { originalname: "resume", mimetype: "application/pdf" };
		const cb = (err: Error | null, accept?: boolean) => {
			expect(err).toBeInstanceOf(Error);
			expect(err?.message).toBe("Only PDF, DOC, and DOCX files are allowed.");
			expect(accept).toBeUndefined();
		};

		cvFileFilter({} as any, invalidFile as any, cb);
	});
});
