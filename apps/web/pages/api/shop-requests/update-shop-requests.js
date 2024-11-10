// pages/api/shop-requests/update-shop-request.js

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import prisma from "@/utils/helpers"; // Direct Prisma client import from helpers

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { status, requestNo, username, password } = req.body;

  if (status === 'REJECTED') {
    return res.status(200).json({ message: 'Request will not proceed.' });
  }

  if (status === 'ACTIVE') {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const partnershipRequest = await tx.partnershipRequests.findUnique({
          where: { requestNo },
        });

        if (!partnershipRequest) {
          throw new Error('Partnership request not found');
        }

        const userNo = uuidv4(); // Generate unique userNo for new user
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create user entry
        const user = await tx.users.create({
          data: {
            userNo,
            username,
            password: hashedPassword,
            status: 'ACTIVE',
            roleId: 2,
          },
        });

        // 2. Create Google map location entry
        const location = await tx.googleMapLocations.create({
          data: {
            placeName: partnershipRequest.googleMapPlaceName,
            latitude: partnershipRequest.latitude,
            longitude: partnershipRequest.longitude,
          },
        });

        // 3. Create address entry
        const address = await tx.addresses.create({
          data: {
            buildingNo: partnershipRequest.buildingNo,
            street: partnershipRequest.street,
            barangay: partnershipRequest.barangay,
            municipality: partnershipRequest.municipality,
            province: partnershipRequest.province,
            postalCode: partnershipRequest.postalNumber,
            googleMapId: location.id,
          },
        });

        // 4. Create shop entry with 8-character shopNo
        const shop = await tx.shops.create({
          data: {
            shopNo: uuidv4().slice(0, 8), // Generate 8-character shopNo
            name: partnershipRequest.shopName,
            contactNo: partnershipRequest.shopContactNo,
            ownerUserNo: user.userNo,
            addressId: address.id,
            status: 'ACTIVE',
            businessLicense: partnershipRequest.businessLicense,
          },
        });

        // 5. Create vendor profile entry
        const vendorProfile = await tx.vendorProfile.create({
          data: {
            userId: user.id,
            shopId: shop.id,
            firstName: partnershipRequest.firstName,
            lastName: partnershipRequest.lastName,
            contactNo: partnershipRequest.contactNo,
            email: partnershipRequest.email,
            position: partnershipRequest.position,
          },
        });

        // 6. Update partnership request status to DONE
        await tx.partnershipRequests.update({
          where: { requestNo },
          data: { status: 'DONE' },
        });

        return { user, location, address, shop, vendorProfile };
      });

      return res.status(200).json({
        message: 'Shop request successfully processed',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'An error occurred while processing the shop request',
        details: error.message,
      });
    }
  } else {
    return res.status(400).json({ error: 'Invalid status value' });
  }
}
