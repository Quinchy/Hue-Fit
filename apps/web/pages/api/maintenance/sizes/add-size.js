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

    let { name, abbreviation, nextId } = req.body;
    name = name.toUpperCase();
    abbreviation = abbreviation.toUpperCase();

    if (!name || !abbreviation) {
      return res.status(400).json({ error: "Name and Abbreviation are required fields." });
    }

    // Check for existing size with the same abbreviation within the shop
    const existingSize = await prisma.size.findFirst({
      where: {
        abbreviation,
        shopId,
      },
    });

    if (existingSize) {
      return res.status(400).json({ error: "Size with this abbreviation already exists." });
    }

    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Create the new size
      const newSize = await prisma.size.create({
        data: {
          shopId,
          name,
          abbreviation,
          nextId: nextId || null,
        },
        select: {
          id: true,
          name: true,
          abbreviation: true,
          nextId: true,
        },
      });

      if (nextId) {
        // Validate that the next size exists within the same shop
        const nextSize = await prisma.size.findFirst({
          where: {
            id: nextId,
            shopId,
          },
        });

        if (!nextSize) {
          throw new Error("Next size not found.");
        }

        // Find the previous size that points to the nextSize
        const previousSize = await prisma.size.findFirst({
          where: {
            shopId,
            nextId: nextSize.id,
          },
        });

        if (previousSize) {
          // Update the previous size's nextId to point to the new size
          await prisma.size.update({
            where: {
              id: previousSize.id,
            },
            data: {
              nextId: newSize.id,
            },
          });
        }

        // Set the new size's nextId to the selected nextSize
        await prisma.size.update({
          where: {
            id: newSize.id,
          },
          data: {
            nextId: nextSize.id,
          },
        });
      } else {
        // If no nextId provided, find the current largest size (nextId: null) and set its nextId to the new size
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

      return newSize;
    });

    return res.status(201).json({ message: "Size added successfully.", type: "success", size: result });
  } catch (error) {
    console.error("Error adding size:", error);
    if (error.message === "Next size not found.") {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
