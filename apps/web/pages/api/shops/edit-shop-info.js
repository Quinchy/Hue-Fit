import { v4 as uuidv4 } from "uuid";
import prisma, { getSessionUser, disconnectPrisma, parseFormData, uploadFileToSupabase } from "@/utils/helpers";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  try {
    const sessionUser = await getSessionUser(req, res);
    if (!sessionUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { fields, files } = await parseFormData(req);
    
    // Retrieve form field values (all fields are arrays)
    const name = fields.name[0];
    const email = fields.email[0];
    const contactNo = fields.contactNo[0];
    const description = fields.description[0] || null;
    const openingTime = fields.openingTime[0];
    const closingTime = fields.closingTime[0];
    const buildingNo = fields.buildingNo[0] || null;
    const street = fields.street[0] || null;
    const barangay = fields.barangay[0];
    const municipality = fields.municipality[0];
    const province = fields.province[0];
    const postalCode = fields.postalCode[0];
    const googleMapPlaceName = fields.googleMapPlaceName[0] || null;
    const latitude = fields.latitude[0] ? Number(fields.latitude[0]) : null;
    const longitude = fields.longitude[0] ? Number(fields.longitude[0]) : null;
    
    let logoUrl = null;
    if (files.logo) {
      // Assume files.logo is an array; take first file.
      const logoFile = Array.isArray(files.logo) ? files.logo[0] : files.logo;
      logoUrl = await uploadFileToSupabase(
        logoFile,
        logoFile.filepath,
        logoFile.originalFilename,
        uuidv4().slice(0, 8),
        "shop/logo"
      );
    }
    
    // Update shop info along with its address and google map location.
    const updatedShop = await prisma.shop.update({
      where: { ownerUserId: sessionUser.id },
      data: {
        name,
        email,
        contactNo,
        description,
        openingTime,
        closingTime,
        ...(logoUrl ? { logo: logoUrl } : {}),
        ShopAddress: {
          update: {
            buildingNo,
            street,
            barangay,
            municipality,
            province,
            postalCode,
            GoogleMapLocation: {
              update: {
                name: googleMapPlaceName,
                latitude,
                longitude,
              },
            },
          },
        },
      },
      include: {
        ShopAddress: { include: { GoogleMapLocation: true } },
      },
    });
    
    res.status(200).json({ success: true, shop: updatedShop });
  } catch (error) {
    console.error("Error updating shop info:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await disconnectPrisma();
  }
}
