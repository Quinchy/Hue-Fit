import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { roleId, permissions } = req.body;

    try {
      // Loop through permissions to upsert each permission based on roleId and pageId
      await Promise.all(
        permissions.map(async (perm) => {
          await prisma.permissions.upsert({
            where: {
              roleId_pageId: { roleId, pageId: perm.pageId }, // Unique composite index for roleId and pageId
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

      res.status(200).json({ message: 'Permissions updated successfully' });
    } catch (error) {
      console.error('Error updating permissions:', error);
      res.status(500).json({ error: 'Error updating permissions' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
