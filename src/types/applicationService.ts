export interface ApplyForRoleResponse {
  applicationId: number;
  userId: number;
  jobRoleId: number;
  applicationStatus: string;
  cvUrl: string;
}

export interface UploadCvFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}