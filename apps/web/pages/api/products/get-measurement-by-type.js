// pages/api/products/get-measurement-by-type.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { productType } = req.query;

        try {
            // Retrieve the session using getServerSession
            const session = await getServerSession(req, res, authOptions);
            const shopNo = session?.user?.shopNo;

            if (!shopNo) {
                return res.status(401).json({ error: 'Unauthorized: No shopNo found in session.' });
            }

            if (!productType) {
                return res.status(400).json({ error: 'Invalid request: productType is required' });
            }

            // Step 1: Get the typeId from the Type table based on productType and shopNo
            const type = await prisma.type.findFirst({
                where: {
                    shopNo: shopNo,
                    name: productType,
                },
                select: { id: true }
            });
            console.log('Product type fetched:', type);

            if (!type) {
                return res.status(404).json({ error: 'Product type not found for this shop.' });
            }

            const typeId = type.id;

            // Step 2: Use typeId and shopNo to get measurementIds from TypeMeasurements
            const typeMeasurements = await prisma.typeMeasurements.findMany({
                where: { shopNo, typeId },
                select: { measurementId: true }
            });

            const measurementIds = typeMeasurements.map(tm => tm.measurementId);

            // Step 3: Fetch measurements from the Measurements table using the measurementIds
            const measurements = await prisma.measurements.findMany({
                where: {
                    id: { in: measurementIds },
                    shopNo
                },
                select: { id: true, name: true }
            });

            const count = measurements.length;
            console.log('Measurements fetched for product type:', measurements);
            console.log('Total measurement count:', count);

            return res.status(200).json({ measurements, count });
        } 
        catch (error) {
            console.error('Error fetching measurements:', error);
            return res.status(500).json({ error: 'Failed to fetch measurements.' });
        }
    } 
    else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}