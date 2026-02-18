import type { FileFilterCallback } from "multer";
import multer from "multer";

const allowedFileTypes = [
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const allowedExtensions = [".pdf", ".doc", ".docx"];

const mimetypeByExtension: Record<string, string> = {
	".pdf": "application/pdf",
	".doc": "application/msword",
	".docx":
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const cvFileFilter = (
	_req: Express.Request,
	file: Express.Multer.File,
	cb: FileFilterCallback,
) => {
	const extensionStart = file.originalname.lastIndexOf(".");
	if (extensionStart < 0) {
		cb(new Error("Only PDF, DOC, and DOCX files are allowed."));
		return;
	}

	const ext = file.originalname.slice(extensionStart).toLowerCase();
	const expectedMimetype = mimetypeByExtension[ext];
	const isAllowedType = allowedFileTypes.includes(file.mimetype);
	const isAllowedExtension = allowedExtensions.includes(ext);
	const isMatchingPair = expectedMimetype === file.mimetype;

	if (isAllowedType && isAllowedExtension && isMatchingPair) {
		cb(null, true);
	} else {
		cb(new Error("Only PDF, DOC, and DOCX files are allowed."));
	}
};

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	fileFilter: cvFileFilter,
});

export default upload;
