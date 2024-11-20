// pages/api/mobile/products/get-generated-products.js
import prisma, { disconnectPrisma } from "@/utils/helpers";

export default async function handler(req, res) {
  console.log("API Request received:", req.method);
  console.log("Request body:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { outfitData } = req.body; // Get the outfitData directly
    console.log("Received outfitData:", outfitData);

    if (!outfitData || typeof outfitData !== "object") {
      return res.status(400).json({ message: "Invalid outfit data" });
    }

    const productVariantNos = Object.values(outfitData).map(
      (item) => item.productVariantNo
    );

    console.log("Fetching product variants with productVariantNos:", productVariantNos);

    const products = [];
    const colorIds = new Set();

    for (const productVariantNo of productVariantNos) {
      const productVariant = await prisma.productVariants.findUnique({
        where: { productVariantNo },
        include: {
          Product: true,
          Color: true,
        },
      });

      if (productVariant) {
        console.log("Found productVariant:", productVariant);

        // Fetch the first image for this productVariantNo from ProductVariantImages
        const productVariantImage = await prisma.productVariantImages.findFirst({
          where: { productVariantNo },
          orderBy: { created_at: "asc" }, // Ensures we get the first image
        });

        const thumbnail = productVariantImage
          ? productVariantImage.imageUrl
          : productVariant.Product.thumbnailURL; // Fallback to product's thumbnailURL if no variant image is found

        products.push({
          name: productVariant.Product.name,
          price: productVariant.price,
          thumbnail, // Use the fetched variant image or fallback
          tags: productVariant.Product.tags, // Fetch the tags directly
          colorId: productVariant.colorId,
        });

        colorIds.add(productVariant.colorId);
      } else {
        console.warn(`No product variant found for ${productVariantNo}`);
      }
    }

    console.log("Collected products:", products);
    console.log("Collected colorIds:", Array.from(colorIds));

    const colors = await prisma.colors.findMany({
      where: { id: { in: Array.from(colorIds) } },
    });

    console.log("Fetched colors:", colors);

    const totalPrice = products.reduce((sum, item) => sum + Number(item.price), 0);
    console.log("Total price:", totalPrice);

    res.status(200).json({ products, colors, totalPrice });
  } catch (error) {
    console.error("Error in get-generated-products API:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  } finally {
    await disconnectPrisma();
  }
}
