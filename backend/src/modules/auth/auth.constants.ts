/** Fixed subject for JWT when using dev mock auth (no DB row). */
export const AUTH_DEV_MOCK_USER_ID =
  '00000000-0000-0000-0000-000000000001';

/**
 * When true and not production: sign-in accepts any valid email + password
 * without checking AspNetUsers. Never enable in production.
 */
export function isAuthDevBypassActive(): boolean {
  return (
    process.env.AUTH_DEV_BYPASS === 'true' &&
    process.env.NODE_ENV !== 'production'
  );
}
