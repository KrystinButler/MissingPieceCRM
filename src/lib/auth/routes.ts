export const PUBLIC_AUTH_PATHS = ['/login', '/auth/error'] as const
export function isPublicAuthPath(pathname: string) { return PUBLIC_AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) }
