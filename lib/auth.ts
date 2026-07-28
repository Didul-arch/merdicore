import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const ADMIN_ROLES = ['super_admin', 'perangkat_desa'];

/** Return the session if its role is in allowedRoles, else null. */
export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role || !allowedRoles.includes(role)) return null;
  return session;
}
