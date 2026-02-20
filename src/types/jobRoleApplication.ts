export interface JobRoleApplicationResponse {
  applicationId: number;
  applicationStatus: string;
  cvUrl?: string;
  email?: string;
  username?: string;
  user?: {
    email?: string;
    username?: string;
  };
}