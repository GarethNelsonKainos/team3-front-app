export interface JobRoleResponse {
  jobRoleId: number;
  roleName: string;
  location: string;
  closingDate: string;
  responsibilities: string;
  sharepointUrl: string;
  numberOfOpenPositions: number;
  capability: {
    capabilityId: number;
    capabilityName: string;
  };
  band: {
    bandId: number;
    bandName: string;
  };
  status: {
    statusId: number;
    statusName: string;
  };
}

export interface JobRoleFilters {
  roleName?: string;
  location?: string;
  closingDate?: string;
  capability?: string[];
  band?: string[];
  orderBy?: string;
  orderDir?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface JobRoleListResponse {
  roles: JobRoleResponse[];
  totalCount?: number;
}