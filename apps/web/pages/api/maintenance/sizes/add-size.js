// pages/api/maintenance/sizes/add-size.js
import prisma, { getSessionShopId } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopId = await getSessionShopId(req, res);

    if (!shopId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let { name, abbreviation, nextTo } = req.body;
    name = name.toUpperCase();
    abbreviation = abbreviation.toUpperCase();
    if (!name || !abbreviation) {
      return res.status(400).json({ error: "Name and Abbreviation are required fields." });
    }

    const existingSize = await prisma.size.findFirst({
      where: {
        abbreviation,
        shopId,
      },
    });

    if (existingSize) {
      return res.status(400).json({ error: "Size with this abbreviation already exists." });
    }

    const newSize = await prisma.size.create({
      data: {
        shopId,
        name,
        abbreviation,
        nextId: null,
      },
    });

    if (nextTo) {
      const nextSize = await prisma.size.findFirst({
        where: {
          id: parseInt(nextTo),
          shopId,
        },
      });

      if (!nextSize) {
        return res.status(400).json({ error: "Next size not found." });
      }

      await prisma.size.update({
        where: {
          id: newSize.id,
        },
        data: {
          nextId: nextSize.id,
        },
      });
    } else {
      const currentLargestSize = await prisma.size.findFirst({
        where: {
          shopId,
          nextId: null,
          id: {
            not: newSize.id,
          },
        },
      });

      if (currentLargestSize) {
        await prisma.size.update({
          where: {
            id: currentLargestSize.id,
          },
          data: {
            nextId: newSize.id,
          },
        });
      }
    }

    return res.status(201).json({ success: true, size: newSize });
  } catch (error) {
    console.error("Error adding size:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
