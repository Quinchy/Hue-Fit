// set-user-permissions.js
import prisma, { disconnectPrisma } from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { roleId, permissions } = req.body;

    try {
      permissions.map(async (perm) => {
        await prisma.permission.upsert({
          where: {
            roleId_pageId: { roleId, pageId: perm.pageId },
          },
          update: {
            can_view: perm.can_view,
          },
          create: {
            roleId,
            pageId: perm.pageId,
            can_view: perm.can_view,
          },
        });
      })

      // Indicate that the client should refresh the session
      res.status(200).json({ message: 'Permissions updated successfully', session_update: true });
    } 
    finally {
      await disconnectPrisma();
    }
  } 
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
