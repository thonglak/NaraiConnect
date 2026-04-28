import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../../db/client';
import { adminUsers, type AdminUser } from '../../db/schema';
import { errForbidden } from '../../lib/errors';

export const loadActiveAdminByUsername = async (username: string): Promise<AdminUser> => {
  const [row] = await db
    .select()
    .from(adminUsers)
    .where(and(eq(adminUsers.username, username), isNull(adminUsers.deletedAt)))
    .limit(1);
  if (!row) throw errForbidden('User is not authorized for admin panel');
  return row;
};
