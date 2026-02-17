export const APP_ROLES = ['admin', 'customer'] as const;
export type AppRole = (typeof APP_ROLES)[number];
