import type { JobRoleApplicationResponse } from "../types/jobRoleApplication";
import type { ApplicationPanelItem } from "../types/application";

export function mapApplicationsToPanelItems(applications: JobRoleApplicationResponse[]): ApplicationPanelItem[] {
  return applications.map((application) => {
    const applicantName =
      application.email ||
      application.username ||
      application.user?.email ||
      application.user?.username ||
      "Unknown applicant";
    const statusLabel = application.applicationStatus || "Unknown";
    return {
      applicationId: application.applicationId,
      applicationStatus: statusLabel,
      applicantName,
      cvUrl: application.cvUrl,
      canAssess:
        statusLabel.toLowerCase() === "inprogress" ||
        statusLabel.toLowerCase() === "in progress",
    };
  });
}