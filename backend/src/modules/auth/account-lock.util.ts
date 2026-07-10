/** ASP.NET Identity-style lockout */
export function isAspNetUserLockedOut(user: {
  LockoutEnabled: boolean;
  LockoutEnd: Date | null;
}): boolean {
  return !!(
    user.LockoutEnabled &&
    user.LockoutEnd &&
    user.LockoutEnd > new Date()
  );
}
