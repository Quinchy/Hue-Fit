// /api/products/upload-virtual-clothe.js
import prisma, { getSessionShopId, uploadFileToSupabase, parseFormData } from "@/utils/helpers";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { fields, files } = await parseFormData(req);
    const variantId = fields.variantId?.[0];
    
    if (!variantId) {
      return res.status(400).json({ error: "Variant ID is required" });
    }
    
    const variant = await prisma.productVariant.findUnique({
      where: { id: parseInt(variantId, 10) },
    });
    
    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }
    
    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const fileObj = fileArray[0];
    const pngClotheURL = await uploadFileToSupabase(
      fileObj,
      fileObj.filepath,
      fileObj.originalFilename,
      variant.productVariantNo,
      "products/product-virtual-fitting"
    );
    
    if (!pngClotheURL) {
      return res.status(415).json({
        error: "PNG upload failed",
        message: "Invalid mime type or unsupported file",
      });
    }
    
    await prisma.productVariant.update({
      where: { id: parseInt(variantId, 10) },
      data: { pngClotheURL },
    });
    
    res.status(200).json({ message: "PNG clothing uploaded successfully", pngClotheURL });
  } catch (err) {
    console.error("Error uploading virtual clothe:", err);
    res.status(500).json({ error: "Error uploading virtual clothe" });
  }
}
