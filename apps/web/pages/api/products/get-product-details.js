// pages/api/products/get-product-details.js

import prisma from '@/utils/helpers'; // Adjust this import based on your Prisma setup

export default async function handler(req, res) {
  try {
    const { productNo } = req.query;

    if (!productNo) {
      return res.status(400).json({ message: "Product number is required" });
    }

    const product = await prisma.products.findUnique({
      where: { productNo },
      include: {
        Type: true,
        Category: true,
        Tags: true,
        ProductVariants: {
          include: {
            ProductVariantImages: true,
            ProductVariantSizes: {
              include: {
                Size: true,
                ProductVariantMeasurements: {
                  include: {
                    Measurement: true,
                    Unit: true
                  }
                }
              }
            },
            Color: true
          }
        }
      }
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
