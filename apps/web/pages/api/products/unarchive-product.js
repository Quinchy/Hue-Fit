import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  }

  // Expecting productNo to be provided as a query parameter
  const { productNo } = req.query;
  if (!productNo) {
    return res.status(400).json({ error: "Missing productNo" });
  }

  try {
    // Update the product to set isArchived to true
    const product = await prisma.product.update({
      where: { productNo },
      data: { isArchived: false },
    });
    return res
      .status(200)
      .json({ message: "Product archived successfully", product });
  } catch (error) {
    console.error("Error archiving product:", error);
    return res.status(500).json({ error: "Error archiving product" });
  }
}
