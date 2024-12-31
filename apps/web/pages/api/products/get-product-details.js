// pages/api/products/get-product-details.js
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  try {
    const { productNo } = req.query;

    if (!productNo) {
      return res.status(400).json({ message: "Product number is required" });
    }

    const product = await prisma.product.findUnique({
      where: { productNo },
      include: {
        Type: true,
        Category: true,
        Tag: true,
        ProductMeasurement: {
          include: {
            Measurement: true,
            Size: true,
          },
        },
        ProductVariant: {
          include: {
            ProductVariantImage: true,
            Color: true,
            ProductVariantSize: {
              include: {
                Size: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
