import { v4 as uuidv4 } from 'uuid';
import prisma from '@/utils/helpers';
import { supabase } from '@/supabaseClient';
import formidable from 'formidable';
import bcrypt from 'bcrypt';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ message: "Error parsing the form data" });
    }

    // Extracting values from fields and ensuring they are properly accessed
    const username = fields['username'] ? fields['username'][0] : null;
    const password = fields['password'] ? fields['password'][0] : null;

    // Define shop details and make sure all fields are correctly extracted
    const shopDetails = {
      shopName: fields['shopName'][0],
      shopContactNumber: fields['shopContactNo'][0],
      buildingNumber: fields['buildingNo'][0],
      street: fields['street'][0],
      barangay: fields['barangay'][0],
      municipality: fields['municipality'][0],
      province: fields['province'][0],
      postalNumber: fields['postalNumber'][0],
      googleMapPlaceName: fields['googleMapPlaceName'][0] || null,
      latitude: parseFloat(fields['latitude'][0]) || null,
      longitude: parseFloat(fields['longitude'][0]) || null,
    };
    
    console.log("Shop details:", shopDetails);
    const contactPerson = {
      firstName: fields['firstName'][0],
      lastName: fields['lastName'][0],
      contactNumber: fields['contactNo'][0],
      email: fields['email'][0],
      position: fields['position'][0],
    };
    console.log("Contact person:", contactPerson);
    const businessLicenseFiles = fields['businessLicense'][0];
    let businessLicenseUrls = businessLicenseFiles ? businessLicenseFiles.split(',') : [];
    console.log("Business license files:", businessLicenseUrls);

    try {
      await prisma.$transaction(async (prisma) => {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        // Create User
        const newUser = await prisma.users.create({
          data: {
            userNo: uuidv4().slice(0, 8),
            username,
            password: hashedPassword,
            status: "PENDING",
            roleId: 2, // Assuming role ID for "Vendor"
          },
        });
        console.log("Successfully created user");
        // First, create GoogleMapLocation
        const newGoogleMapLocation = await prisma.googleMapLocations.create({
          data: {
            placeName: shopDetails.googleMapPlaceName,
            latitude: shopDetails.latitude,
            longitude: shopDetails.longitude,
          },
        });
        console.log("Successfully created Google Map Location");
        // Create Address
        const newAddress = await prisma.addresses.create({
          data: {
            buildingNo: shopDetails.buildingNumber,
            street: shopDetails.street,
            barangay: shopDetails.barangay,
            municipality: shopDetails.municipality,
            province: shopDetails.province,
            postalCode: shopDetails.postalNumber,
            googleMapId: newGoogleMapLocation.id, // Associating the newly created GoogleMapLocation with Address
          },
        });
        console.log("Successfully created address");
        // Create Shop
        const newShop = await prisma.shops.create({
          data: {
            shopNo: uuidv4().slice(0, 8),
            name: shopDetails.shopName,
            contactNo: shopDetails.shopContactNumber,
            status: "PENDING",
            ownerUserNo: newUser.userNo,
            addressId: newAddress.id,  // Link shop to the address
          },
        });
        console.log("Successfully created shop");
        // Create Partnership Request
        await prisma.partnershipRequests.create({
          data: {
            requestNo: uuidv4().slice(0, 8),
            userId: newUser.id,
            shopId: newShop.id,
            status: "PENDING",
          },
        });
        console.log("Successfully created partnership request");
        // Create Vendor Profile for the contact person
        await prisma.vendorProfile.create({
          data: {
            userId: newUser.id,
            shopId: newShop.id,
            firstName: contactPerson.firstName,
            lastName: contactPerson.lastName,
            contactNo: contactPerson.contactNumber,
            email: contactPerson.email,
            position: contactPerson.position,
          },
        });
        console.log("Successfully created vendor profile");
        // Insert each uploaded business license URL into the ShopBusinessLicenses table
        for (const url of businessLicenseUrls) {
          await prisma.shopBusinessLicenses.create({
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
      res.status(500).json({ message: "Internal server error" });
    }
  });
}
