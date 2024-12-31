// pages/api/products/get-measurement-by-type.js

import prisma , { getSessionShopId } from '@/utils/helpers';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { productType } = req.query;

        try {
            // Retrieve the session using getServerSession
            const shopId = await getSessionShopId(req, res);

            if (!shopId) {
                return res.status(401).json({ error: 'Unauthorized: No shopId found in session.' });
            }

            if (!productType) {
                return res.status(400).json({ error: 'Invalid request: productType is required' });
            }

            // Step 1: Get the typeId from the Type table based on productType and shopId
            const type = await prisma.type.findFirst({
                where: {
                    shopId: shopId,
                    name: productType,
                },
                select: { id: true }
            });
            console.log('Product type fetched:', type);

            if (!type) {
                return res.status(404).json({ error: 'Product type not found for this shop.' });
            }

            const typeId = type.id;

            // Step 3: Fetch measurements from the Measurements table using the measurementIds
            const measurements = await prisma.measurement.findMany({
                where: {
                    typeId, 
                    shopId
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