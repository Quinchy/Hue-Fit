import { v4 as uuidv4 } from 'uuid';
import prisma from '@/utils/helpers';
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
      console.log(fields);
      const requestNo = uuidv4().slice(0, 8);
      const businessLicenseFiles = Object.keys(files).filter(key => key.startsWith('businessLicense['));
      const businessLicensesURL = [];
      
      for (const key of businessLicenseFiles) {
        const fileArray = files[key];
        for (const file of fileArray) {
          const fileURL = await uploadFileToSupabase(
            file,
            file.filepath,
            file.originalFilename,
            requestNo,
            'business-licenses/licenses'
          );
          businessLicensesURL.push(fileURL);
          console.log(`Uploaded file URL: ${fileURL}`);
        }
      }

      const firstName = fields.firstName[0];
      const lastName = fields.lastName[0];
      const contactNo = fields.contactNo[0];
      const email = fields.email[0];
      const position = fields.position[0];
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
      const shopLogo = fields.shopLogo[0];
      const googleMapPlaceName = fields.googleMapPlaceName[0];
      const latitude = parseFloat(fields.latitude[0]);
      const longitude = parseFloat(fields.longitude[0]);      
      const username = fields.username[0];
      const password = fields.password[0];
      console.log(username);
      await prisma.$transaction(async (prisma) => {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        const userNo = uuidv4().slice(0, 8);
        const newUser = await prisma.user.create({
          data: {
            userNo,
            username,
            password: hashedPassword,
            status: "PENDING",
            roleId: 2,
          },
        });
        console.log("Successfully created user");
        const newGoogleMapLocation = await prisma.googleMapLocation.create({
          data: {
            name: googleMapPlaceName,
            latitude,
            longitude,
          },
        });
        console.log("Successfully created Google Map Location");
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
        console.log("Successfully created address");
        const newShop = await prisma.shop.create({
          data: {
            shopNo: uuidv4().slice(0, 8),
            name: shopName,
            contactNo: shopContactNo,
            email: shopEmail,
            status: "PENDING",
            ownerUserId: newUser.id,
            addressId: newAddress.id,
            openingTime,
            closingTime,
          },
        });
        console.log("Successfully created shop");
        await prisma.partnershipRequest.create({
          data: {
            requestNo,
            userId: newUser.id,
            shopId: newShop.id,
            status: "PENDING",
          },
        });
        console.log("Successfully created partnership request");
        await prisma.vendorProfile.create({
          data: {
            userId: newUser.id,
            shopId: newShop.id,
            firstName,
            lastName,
            contactNo,
            email,
            position,
          },
        });
        console.log("Successfully created vendor profile");
        for (const url of businessLicensesURL) {
          await prisma.shopBusinessLicense.create({
            data: {
              shopId: newShop.id,
              licenseUrl: url,
            },
          });
        }
      });
      console.log("Successfully created shop business licenses");
      res.status(201).json({ message: "Partnership request submitted successfully" });
    } 
    catch (error) {
      console.error("Error processing partnership request:", error);

      // Handle Prisma error for unique constraints
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        let errorMessage;
  
        if (field === 'username') {
          errorMessage = "The username is already taken. Please choose another.";
        } else if (field === 'shopName') {
          errorMessage = "The shop name is already registered. Please choose another.";
        } else {
          errorMessage = `Duplicate value detected for the field '${field}'.`;
        }
  
        return res.status(409).json({ message: errorMessage });
      }
  
      res.status(500).json({ message: "Internal server error" });
    };
}
