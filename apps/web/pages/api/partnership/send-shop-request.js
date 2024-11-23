import { v4 as uuidv4 } from 'uuid';
import prisma from '@/utils/helpers';
import { supabase } from '@/supabaseClient';
import formidable from 'formidable';
import bcrypt from 'bcrypt';
import { parseFormData } from '@/utils/helpers';
import { uploadFileToSupabase } from '@/utils/helpers';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

    try {
      const { fields, files } = await parseFormData(req);
      // console.log('3. Form data parsed:', fields, files);
      console.log('3.1. Files:', files.businessLicense[1]);
      // const requestNo = uuidv4().slice(0, 8);
      // const firstName = fields.firstName[0];
      // const lastName = fields.lastName[0];
      // const contactNo = fields.contactNo[0];
      // const email = fields.email[0];
      // const position = fields.position[0];
      // const shopName = fields.shopName[0];
      // const shopContactNo = fields.shopContactNo[0].filepath;
      // const buildingNo = fields.buildingNo;
      // const street = fields.street[0];
      // const barangay = fields.barangay[0];
      // const municipality = fields.municipality[0];
      // const province = fields.province[0];
      // const postalNumber = fields.postalNumber[0];
      // const googleMapPlaceName = fields.googleMapPlaceName[0];
      // const latitude = fields.latitude;
      // const longitude = fields.longitude;
      // const username = fields.username[0];
      // const password = fields.password[0];
      // console.log('4. Fields extracted:', firstName, lastName, contactNo, email, position, shopName, shopContactNo, buildingNo, street, barangay, municipality, province, postalNumber, googleMapPlaceName, latitude, longitude, username, password);
      // await prisma.$transaction(async (prisma) => {
      //   const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      //   const newUser = await prisma.users.create({
      //     data: {
      //       userNo: uuidv4().slice(0, 8),
      //       username,
      //       password: hashedPassword,
      //       status: "PENDING",
      //       roleId: 2,
      //     },
      //   });
      //   console.log("Successfully created user");
      //   const newGoogleMapLocation = await prisma.googleMapLocations.create({
      //     data: {
      //       placeName: shopDetails.googleMapPlaceName,
      //       latitude: shopDetails.latitude,
      //       longitude: shopDetails.longitude,
      //     },
      //   });
      //   console.log("Successfully created Google Map Location");
      //   const newAddress = await prisma.addresses.create({
      //     data: {
      //       buildingNo: shopDetails.buildingNumber,
      //       street: shopDetails.street,
      //       barangay: shopDetails.barangay,
      //       municipality: shopDetails.municipality,
      //       province: shopDetails.province,
      //       postalCode: shopDetails.postalNumber,
      //       googleMapId: newGoogleMapLocation.id,
      //     },
      //   });
      //   console.log("Successfully created address");
      //   const newShop = await prisma.shops.create({
      //     data: {
      //       shopNo: uuidv4().slice(0, 8),
      //       name: shopDetails.shopName,
      //       contactNo: shopDetails.shopContactNumber,
      //       status: "PENDING",
      //       ownerUserNo: newUser.userNo,
      //       addressId: newAddress.id,
      //     },
      //   });
      //   console.log("Successfully created shop");
      //   await prisma.partnershipRequests.create({
      //     data: {
      //       requestNo: uuidv4().slice(0, 8),
      //       userId: newUser.id,
      //       shopId: newShop.id,
      //       status: "PENDING",
      //     },
      //   });
      //   console.log("Successfully created partnership request");
      //   await prisma.vendorProfile.create({
      //     data: {
      //       userId: newUser.id,
      //       shopId: newShop.id,
      //       firstName: contactPerson.firstName,
      //       lastName: contactPerson.lastName,
      //       contactNo: contactPerson.contactNumber,
      //       email: contactPerson.email,
      //       position: contactPerson.position,
      //     },
      //   });
      //   console.log("Successfully created vendor profile");
      //   for (const url of businessLicenseUrls) {
      //     await prisma.shopBusinessLicenses.create({
      //       data: {
      //         shopId: newShop.id,
      //         licenseUrl: url,
      //       },
      //     });
      //   }
      // });
      console.log("Successfully created shop business licenses");
      res.status(201).json({ message: "Partnership request submitted successfully" });
    } 
    catch (error) {
      console.error("Error processing partnership request:", error);
      res.status(500).json({ message: "Internal server error" });
    };
}
