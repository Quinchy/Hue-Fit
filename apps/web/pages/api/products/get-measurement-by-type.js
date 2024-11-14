// pages/api/products/get-measurement-by-type.js

import prisma from '@/utils/helpers';
import { getSessionUser } from '@/utils/helpers';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { productType } = req.query;

        try {
            // Retrieve the user session and shopNo
            const user = await getSessionUser(req, res);
            const shopNo = user?.shopNo;

            if (!shopNo) {
                return res.status(401).json({ error: 'Unauthorized: No shopNo found in session.' });
            }

            if (!productType) {
                return res.status(400).json({ error: 'Invalid request: productType is required' });
            }

            // Fetch measurements filtered by shopNo and productType
            const measurements = await prisma.measurement.findMany({
                where: { shopNo, productType }
            });

            return res.status(200).json({ measurements });
        } catch (error) {
            console.error('Error fetching measurements:', error);
            return res.status(500).json({ error: 'Failed to fetch measurements.' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
