import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the user's initial roleId from the session
  const sessionRoleId = session.user.roleId;

  if (req.method === 'POST') {
    const { roleId } = req.body; // Use roleId from the POST request if provided

    try {
      // Determine which roleId to use: either from request body or from the session
      const targetRoleId = roleId ? parseInt(roleId) : parseInt(sessionRoleId);

      // Fetch permissions for the determined roleId
      const permissions = await prisma.permissions.findMany({
        where: { roleId: targetRoleId },
      });

      // Fetch all roles excluding the CUSTOMER role for the Select dropdown
      const roles = await prisma.roles.findMany({
        where: { name: { not: 'CUSTOMER' } },
        select: { id: true, name: true },
      });

      // Fetch all pages to populate the permissions table
      const pages = await prisma.pages.findMany({
        select: { id: true, name: true, description: true },
      });

      res.status(200).json({
        pages,
        permissions,
        roles,
        currentRoleId: targetRoleId,
        currentRoleName: roles.find((role) => role.id === targetRoleId)?.name || '',
      });
    } catch (error) {
      console.error('Error fetching permissions, roles, or pages:', error);
      res.status(500).json({ error: 'Error fetching data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
