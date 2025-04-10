// pages/api/partnership/send-shop-request.js

import { v4 as uuidv4 } from "uuid";
import prisma from "@/utils/helpers";
import { parseFormData, uploadFileToSupabase } from "@/utils/helpers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

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
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = session.user.id;
    const { fields, files } = await parseFormData(req);
    const requestNo = uuidv4().slice(0, 8);

    const businessLicenseFiles = Object.keys(files).filter((key) =>
      key.startsWith("businessLicense[")
    );
    const businessLicensesURL = [];
    for (const key of businessLicenseFiles) {
      const fileArray = files[key];
      for (const file of fileArray) {
        const fileURL = await uploadFileToSupabase(
          file,
          file.filepath,
          file.originalFilename,
          requestNo,
          "business-licenses/licenses"
        );
        businessLicensesURL.push(fileURL);
      }
    }

    let shopLogoURL = null;
    if (files.shopLogo) {
      const logoFiles = files.shopLogo;
      for (const file of logoFiles) {
        shopLogoURL = await uploadFileToSupabase(
          file,
          file.filepath,
          file.originalFilename,
          requestNo,
          "shop/logo"
        );
        break;
      }
    }

    const shopName = fields.shopName[0];
    const shopContactNo = fields.shopContactNo[0];
    const shopEmail = fields.shopEmail[0];
    const buildingNo = fields.buildingNo[0];
    const street = fields.street[0];
    const barangay = fields.barangay[0];
    const municipality = fields.municipality[0];
    const province = fields.province[0];
    const postalNumber = fields.postalNumber[0];
    const openingTime = fields.openingTime[0];
    const closingTime = fields.closingTime[0];
    const googleMapPlaceName = fields.googleMapPlaceName[0];
    const latitude = parseFloat(fields.latitude[0]);
    const longitude = parseFloat(fields.longitude[0]);
    const removeShopLogo = fields.removeShopLogo
      ? fields.removeShopLogo[0] === "true"
      : false;

    const existingRequest = await prisma.partnershipRequest.findFirst({
      where: { userId },
      include: {
        Shop: {
          include: {
            ShopAddress: {
              include: { GoogleMapLocation: true },
            },
          },
        },
      },
    });

    if (existingRequest) {
      // Update the Google Map location details.
      await prisma.googleMapLocation.update({
        where: { id: existingRequest.Shop.ShopAddress.googleMapId },
        data: { name: googleMapPlaceName, latitude, longitude },
      });

      // Update the shop address.
      await prisma.shopAddress.update({
        where: { id: existingRequest.Shop.addressId },
        data: {
          buildingNo,
          street,
          barangay,
          municipality,
          province,
          postalCode: postalNumber,
        },
      });

      // Prepare shop update data.
      const shopUpdateData = {
        name: shopName,
        contactNo: shopContactNo,
        email: shopEmail,
        openingTime,
        closingTime,
      };
      if (removeShopLogo) {
        shopUpdateData.logo = null;
      } else if (shopLogoURL) {
        shopUpdateData.logo = shopLogoURL;
      }

      // Update the shop.
      const updatedShop = await prisma.shop.update({
        where: { id: existingRequest.Shop.id },
        data: shopUpdateData,
      });

      // Reset the partnership request status to "PENDING".
      await prisma.partnershipRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: "PENDING",
          message:
            "Your shop request is now send to the Admin again, for manual verification and inspection of your data.",
        },
      });

      // Delete all previous business licenses for this shop before uploading new ones.
      await prisma.shopBusinessLicense.deleteMany({
        where: { shopId: updatedShop.id },
      });

      // Add new business license URLs if provided.
      if (businessLicensesURL.length > 0) {
        for (const url of businessLicensesURL) {
          await prisma.shopBusinessLicense.create({
            data: { shopId: updatedShop.id, licenseUrl: url },
          });
        }
      }

      return res.status(200).json({
        message: "Your shop request is now send to the Admin again, for manual verification and inspection of your data.",
        status: "PENDING",
        shop: updatedShop,
      });
    } 
    else {
      // Create a new Google Map location.
      const newGoogleMapLocation = await prisma.googleMapLocation.create({
        data: { name: googleMapPlaceName, latitude, longitude },
      });
      // Create a new shop address.
      const newAddress = await prisma.shopAddress.create({
        data: {
          buildingNo,
          street,
          barangay,
          municipality,
          province,
          postalCode: postalNumber,
          googleMapId: newGoogleMapLocation.id,
        },
      });
      // Create a new shop.
      const newShop = await prisma.shop.create({
        data: {
          shopNo: uuidv4().slice(0, 8),
          name: shopName,
          contactNo: shopContactNo,
          email: shopEmail,
          status: "PENDING",
          ownerUserId: userId,
          addressId: newAddress.id,
          openingTime,
          closingTime,
          logo: shopLogoURL,
        },
      });
      // Update the vendor profile with the new shop ID.
      await prisma.vendorProfile.update({
        where: { userId: userId },
        data: { shopId: newShop.id },
      });
      // Create a new partnership request.
      await prisma.partnershipRequest.create({
        data: {
          requestNo,
          userId,
          shopId: newShop.id,
          status: "PENDING",
        },
      });
      // Add business license URLs.
      for (const url of businessLicensesURL) {
        await prisma.shopBusinessLicense.create({
          data: { shopId: newShop.id, licenseUrl: url },
        });
      }
      if (fields.removedBusinessLicenseUrls) {
        const removedUrls = JSON.parse(fields.removedBusinessLicenseUrls[0]);
        for (const url of removedUrls) {
          await prisma.shopBusinessLicense.deleteMany({
            where: { shopId: newShop.id, licenseUrl: url },
          });
        }
      }
      return res.status(201).json({
        message: "Your shop request is now send to the Admin, for manual verification and inspection of your data.",
        status: "PENDING",
        shop: newShop,
      });
    }
  }
  catch (error) {
    console.error("Error processing shop request:", error);
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      const errorMessage =
        field === "shopName"
          ? "The shop name is already registered. Please choose another."
          : `Duplicate value detected for the field '${field}'.`;
      return res.status(409).json({ message: errorMessage });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}
