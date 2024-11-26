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
    for (const productVariantNo of productVariantNos) {
      const productVariant = await prisma.productVariants.findUnique({
        where: { productVariantNo },
        include: {
          Product: true,
          Color: true,
        },
      });

      if (productVariant) {
        const productVariantImage = await prisma.productVariantImages.findFirst({
          where: { productVariantNo },
          orderBy: { created_at: "asc" },
        });

        const thumbnail = productVariantImage
          ? productVariantImage.imageUrl
          : productVariant.Product.thumbnailURL;

        products.push({
          name: `${productVariant.Color.name} ${productVariant.Product.name}`,
          price: productVariant.price,
          thumbnail,
          tags: productVariant.Product.tags,
        });
      } else {
        console.warn(`No product variant found for ${productVariantNo}`);
      }
    }

    const totalPrice = products.reduce((sum, item) => sum + Number(item.price), 0);

    res.status(200).json({ products, totalPrice });
  } catch (error) {
    console.error("Error in get-generated-products API:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  } finally {
    await disconnectPrisma();
  }
}
