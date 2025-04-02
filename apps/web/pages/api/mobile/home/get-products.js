// pages/api/mobile/home/get-products.js
import prisma from "@/utils/helpers";

export default async function getProducts(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";
  const typeQuery = req.query.type || ""; // comma-separated types

  let whereCondition = {};

  if (search) {
    whereCondition.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (typeQuery) {
    const typesArray = typeQuery.split(",").map((t) => t.trim());
    whereCondition.Type = {
      name: { in: typesArray },
    };
  }

  // Only get products that are not archived.
  whereCondition.isArchived = false;

  try {
    const productsData = await prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { id: "asc" },
      where: whereCondition,
      include: {
        ProductVariant: {
          take: 1,
          orderBy: { id: "asc" },
        },
      },
    });

    const products = productsData.map((product) => {
      const firstVariant = product.ProductVariant[0];
      return {
        id: product.id,
        productVariantNo: firstVariant?.productVariantNo || "",
        thumbnailURL: product.thumbnailURL || "",
        productName: product.name,
        price: firstVariant?.price?.toString() || "0.00",
      };
    });

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
