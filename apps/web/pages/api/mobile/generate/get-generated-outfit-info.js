// File: pages/api/mobile/generate/get-generated-outfit-info.js
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  console.log("Starting handler for get-generated-outfit-info");

  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Use outfitId as provided by the client
  const { outfitId } = req.body;
  console.log("Received outfitId:", outfitId);

  if (!outfitId) {
    console.log("Missing outfitId in request body");
    return res.status(400).json({ message: "Missing outfitId" });
  }

  try {
    console.log("Fetching generated outfit info for ID:", outfitId);
    const generatedOutfit = await prisma.generatedOutfit.findUnique({
      where: { id: Number(outfitId) },
      include: {
        items: {
          include: {
            ProductVariant: {
              include: {
                Product: true,
                Color: true,
                ProductVariantImage: true,
              },
            },
          },
        },
      },
    });

    if (!generatedOutfit) {
      console.log("Generated outfit not found for ID:", outfitId);
      return res.status(404).json({ message: "Generated outfit not found" });
    }

    console.log("Generated outfit fetched successfully");

    // Transform the data for UI consumption
    const items = generatedOutfit.items.map(item => {
      const pv = item.ProductVariant;
      return {
        productId: pv.productId,
        price: pv.price,
        productName: pv.Product?.name,
        colorName: pv.Color?.name,
        colorHex: pv.Color?.hexcode,
        productVariantImage:
          pv.ProductVariantImage && pv.ProductVariantImage.length > 0
            ? pv.ProductVariantImage[0].imageURL
            : null,
      };
    });

    const responseData = {
      id: generatedOutfit.id,
      name: generatedOutfit.name,
      style: generatedOutfit.style,
      items,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching generated outfit info:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }

  console.log("Handler for get-generated-outfit-info finished");
}
