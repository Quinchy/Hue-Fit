// File: pages/api/mobile/generate/get-wardrobe.js
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  const { wardrobeId } = req.body;
  if (!wardrobeId) {
    return res.status(400).json({ message: 'Wardrobe ID is required' });
  }
  try {
    const wardrobe = await prisma.generatedOutfit.findUnique({
      where: { id: Number(wardrobeId) },
      include: {
        items: {
          include: {
            ProductVariant: {
              include: {
                Product: { include: { Type: true } },
                Color: true,
                ProductVariantImage: true,
              },
            },
          },
        },
      },
    });
    if (!wardrobe) {
      return res.status(404).json({ message: 'Wardrobe not found' });
    }
    const typeOrderMapping = {
      "OUTERWEAR": 1,
      "UPPERWEAR": 2,
      "LOWERWEAR": 3,
      "FOOTWEAR": 4,
    };
    const sortedItems = wardrobe.items.sort((a, b) => {
      const typeA = a.ProductVariant.Product.Type.name.toUpperCase();
      const typeB = b.ProductVariant.Product.Type.name.toUpperCase();
      const orderA = typeOrderMapping[typeA] || 99;
      const orderB = typeOrderMapping[typeB] || 99;
      return orderA - orderB;
    });
    const colorPalette = [];
    sortedItems.forEach(item => {
      const color = item.ProductVariant.Color;
      if (color && !colorPalette.find(c => c.hexcode === color.hexcode)) {
        const productType = item.ProductVariant.Product.Type.name;
        colorPalette.push({ name: productType, hexcode: color.hexcode });
      }
    });
    res.status(200).json({
      wardrobe: {
        id: wardrobe.id,
        userId: wardrobe.userId,
        name: wardrobe.name,
        style: wardrobe.style,
        created_at: wardrobe.created_at,
        updated_at: wardrobe.updated_at,
        items: sortedItems,
        color_palette: colorPalette,
      },
    });
  } catch (error) {
    console.error("Error fetching wardrobe:", error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
