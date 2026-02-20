export interface ApplicationPanelItem {
  applicationId: number;
  applicationStatus: string;
  applicantName: string;
  cvUrl?: string;
  canAssess: boolean;
}