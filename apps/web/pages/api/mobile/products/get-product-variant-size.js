import prisma from "@/utils/helpers";

const getProductVariantSizes = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { productVariantId } = req.body;

  if (!productVariantId) {
    return res.status(400).json({ message: "Product variant id is required." });
  }

  try {
    const variantSizes = await prisma.productVariantSize.findMany({
      where: { productVariantId: Number(productVariantId) },
      include: {
        Size: true, // Optionally include size details
      },
    });

    return res.status(200).json({
      message: "Product variant sizes fetched successfully.",
      variantSizes,
    });
  } catch (error) {
    console.error("Error fetching product variant sizes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default getProductVariantSizes;
