// get-user-permissions.js
import prisma, { getSessionUser, fetchPermissions, disconnectPrisma } from '@/utils/helpers';

export default async function handler(req, res) {
  const sessionUser = await getSessionUser(req, res);

  if (!sessionUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const roleId = req.body.roleId || sessionUser.roleId;

  try {
    const permissions = await fetchPermissions(roleId);
    const roles = await prisma.roles.findMany({
      where: { name: { not: 'CUSTOMER' } },
      select: { id: true, name: true },
    });
    const pages = await prisma.pages.findMany({
      select: { id: true, name: true, description: true },
    });

    res.status(200).json({
      pages,
      permissions,
      roles,
      currentRoleId: roleId,
      currentRoleName: roles.find((role) => role.id === roleId)?.name || '',
    });
  } 
  finally {
    await disconnectPrisma();
  }
}
