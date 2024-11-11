// set-user-permissions.js
import prisma, { disconnectPrisma } from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { roleId, permissions } = req.body;

    try {
      await Promise.all(
        permissions.map(async (perm) => {
          await prisma.permissions.upsert({
            where: {
              roleId_pageId: { roleId, pageId: perm.pageId },
            },
            update: {
              can_view: perm.can_view,
              can_edit: perm.can_edit,
              can_add: perm.can_add,
              can_delete: perm.can_delete,
            },
            create: {
              roleId,
              pageId: perm.pageId,
              can_view: perm.can_view,
              can_edit: perm.can_edit,
              can_add: perm.can_add,
              can_delete: perm.can_delete,
            },
          });
        })
      );

      // Indicate that the client should refresh the session
      res.status(200).json({ message: 'Permissions updated successfully', session_update: true });
    } finally {
      await disconnectPrisma();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
