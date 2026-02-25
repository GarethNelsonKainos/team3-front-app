export const BASE_URL = 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  JOB_ROLES: '/job-roles',
} as const;

export const URL_PATTERNS = {
  LOGIN: '**/login',
  REGISTER: '**/register',
  JOB_ROLES: '**/job-roles',
  JOB_ROLE_DETAIL: '**/job-roles/*',
  JOB_ROLE_APPLY: '**/job-roles/*/apply',
} as const;

export const buildUrl = (path: string) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
};

export const buildJobRolePath = (roleId: string | number): string => {
  return `${ROUTES.JOB_ROLES}/${roleId}`;
};

export const buildJobRoleApplyPath = (roleId: string | number): string => {
  return `${buildJobRolePath(roleId)}/apply`;
};
