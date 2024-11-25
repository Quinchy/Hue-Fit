// pages/api/maintenance/sizes/add-size.js
import prisma, { getSessionShopNo } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const shopNo = await getSessionShopNo(req, res);

    if (!shopNo) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let { name, abbreviation, nextTo } = req.body;
    name = name.toUpperCase();
    abbreviation = abbreviation.toUpperCase();
    if (!name || !abbreviation) {
      return res.status(400).json({ error: "Name and Abbreviation are required fields." });
    }

    const existingSize = await prisma.sizes.findFirst({
      where: {
        abbreviation,
        shopNo,
      },
    });

    if (existingSize) {
      return res.status(400).json({ error: "Size with this abbreviation already exists." });
    }

    const newSize = await prisma.sizes.create({
      data: {
        shopNo,
        name,
        abbreviation,
        nextId: null,
      },
    });

    if (nextTo) {
      const nextSize = await prisma.sizes.findFirst({
        where: {
          id: parseInt(nextTo),
          shopNo,
        },
      });

      if (!nextSize) {
        return res.status(400).json({ error: "Next size not found." });
      }

      await prisma.sizes.update({
        where: {
          id: newSize.id,
        },
        data: {
          nextId: nextSize.id,
        },
      });
    } else {
      const currentLargestSize = await prisma.sizes.findFirst({
        where: {
          shopNo,
          nextId: null,
          id: {
            not: newSize.id,
          },
        },
      });

      if (currentLargestSize) {
        await prisma.sizes.update({
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
