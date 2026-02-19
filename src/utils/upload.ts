import type { FileFilterCallback } from "multer";
import multer from "multer";

const ALLOWED_FILE_TYPES = [
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

const TEN_MEGABYTES = 10 * 1024 * 1024;

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
	const isAllowedType = ALLOWED_FILE_TYPES.includes(file.mimetype);
	const isAllowedExtension = ALLOWED_EXTENSIONS.includes(ext);
	const isMatchingPair = expectedMimetype === file.mimetype;

	if (isAllowedType && isAllowedExtension && isMatchingPair) {
		cb(null, true);
	} else {
		cb(new Error("Only PDF, DOC, and DOCX files are allowed."));
	}
};

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: TEN_MEGABYTES },
	fileFilter: cvFileFilter,
});

export default upload;
