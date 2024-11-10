import { v4 as uuidv4 } from 'uuid';
import prisma from '@/utils/helpers';
import { supabase } from '@/supabaseClient';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ message: "Error parsing the form data" });
    }

    const requestNo = uuidv4().slice(0, 8); // Generate an 8-character unique ID
    // Construct contactPerson and shop objects manually
    const contactPerson = {
      firstName: fields['contactPerson[firstName]'] ? fields['contactPerson[firstName]'][0] : null,
      lastName: fields['contactPerson[lastName]'] ? fields['contactPerson[lastName]'][0] : null,
      contactNumber: fields['contactPerson[contactNumber]'] ? fields['contactPerson[contactNumber]'][0] : null,
      email: fields['contactPerson[email]'] ? fields['contactPerson[email]'][0] : null,
      position: fields['contactPerson[position]'] ? fields['contactPerson[position]'][0] : null,
    };

    const shop = {
      shopName: fields['shop[shopName]'] ? fields['shop[shopName]'][0] : null,
      shopContactNumber: fields['shop[shopContactNumber]'] ? fields['shop[shopContactNumber]'][0] : null,
      buildingNumber: fields['shop[buildingNumber]'] ? fields['shop[buildingNumber]'][0] : null,
      street: fields['shop[street]'] ? fields['shop[street]'][0] : null,
      barangay: fields['shop[barangay]'] ? fields['shop[barangay]'][0] : null,
      municipality: fields['shop[municipality]'] ? fields['shop[municipality]'][0] : null,
      province: fields['shop[province]'] ? fields['shop[province]'][0] : null,
      postalNumber: fields['shop[postalNumber]'] ? fields['shop[postalNumber]'][0] : null,
      googleMapPlaceName: fields['shop[googleMapPlaceName]'] ? fields['shop[googleMapPlaceName]'][0] : null,
      latitude: fields['shop[latitude]'] ? parseFloat(fields['shop[latitude]'][0]) : null,
      longitude: fields['shop[longitude]'] ? parseFloat(fields['shop[longitude]'][0]) : null,
    };
    const businessLicenseFile = files['shop[businessLicense]'][0];
    const fs = require('fs').promises;
    let businessLicenseUrl = null;

    // Upload the business license file to Supabase storage if provided
    if (businessLicenseFile && businessLicenseFile.filepath) {
      const fileBuffer = await fs.readFile(businessLicenseFile.filepath);
      try {
        const { data: uploadedFile, error: uploadError } = await supabase.storage
          .from('business-licenses')
          .upload(`licenses/${requestNo}-${businessLicenseFile.originalFilename}`, fileBuffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: businessLicenseFile.mimetype,
          });

        if (uploadError) {
          console.error("File upload error:", uploadError.message);
          return res.status(500).json({ message: "Failed to upload the business license file" });
        }

        // Construct the full URL of the uploaded file
        businessLicenseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-licenses/${uploadedFile.path}`;
      } 
      catch (error) {
        console.error("Unexpected error during file upload:", error);
        return res.status(500).json({ message: "Internal server error during file upload" });
      }
    } 
    else {
      console.log("No valid business license file provided.");
    }
    console.log("Data to insert into partnershipRequests table:");
    console.log("requestNo:", requestNo);
    console.log("firstName:", contactPerson.firstName);
    console.log("lastName:", contactPerson.lastName);
    console.log("contactNo:", contactPerson.contactNumber);
    console.log("email:", contactPerson.email);
    console.log("position:", contactPerson.position);
    console.log("businessLicense URL:", businessLicenseUrl); // File URL
    console.log("shopName:", shop.shopName);
    console.log("shopContactNo:", shop.shopContactNumber);
    console.log("buildingNo:", shop.buildingNumber || null);
    console.log("street:", shop.street || null);
    console.log("barangay:", shop.barangay);
    console.log("municipality:", shop.municipality);
    console.log("province:", shop.province);
    console.log("postalNumber:", shop.postalNumber);
    console.log("googleMapPlaceName:", shop.googleMapPlaceName || null);
    console.log("longitude:", shop.longitude || null);
    console.log("latitude:", shop.latitude || null);
    // Insert the request into the PartnershipRequests table
   try {
      const newRequest = await prisma.partnershipRequests.create({
        data: {
          requestNo,
          firstName: contactPerson.firstName,
          lastName: contactPerson.lastName,
          contactNo: contactPerson.contactNumber,
          email: contactPerson.email,
          position: contactPerson.position,
          businessLicense: businessLicenseUrl, // Store the file URL
          shopName: shop.shopName,
          shopContactNo: shop.shopContactNumber,
          buildingNo: shop.buildingNumber || null,
          street: shop.street || null,
          barangay: shop.barangay,
          municipality: shop.municipality,
          province: shop.province,
          postalNumber: shop.postalNumber,
          googleMapPlaceName: shop.googleMapPlaceName || null,
          longitude: shop.longitude || null,
          latitude: shop.latitude || null,
          status: "PENDING",
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      return res.status(201).json({
        message: "Partnership request submitted successfully",
        request: {
          requestNo: newRequest.requestNo,
          contactPerson: {
            firstName: newRequest.firstName,
            lastName: newRequest.lastName,
            contactNo: newRequest.contactNo,
            email: newRequest.email,
            position: newRequest.position,
          },
          shop: {
            businessLicense: newRequest.businessLicense,
            shopName: newRequest.shopName,
            shopContactNo: newRequest.shopContactNo,
            buildingNo: newRequest.buildingNo,
            street: newRequest.street,
            barangay: newRequest.barangay,
            municipality: newRequest.municipality,
            province: newRequest.province,
            postalNumber: newRequest.postalNumber,
            googleMapPlaceName: newRequest.googleMapPlaceName,
            longitude: newRequest.longitude,
            latitude: newRequest.latitude,
          },
        },
      });
    } 
    catch (error) {
      console.error("Error processing partnership request:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}