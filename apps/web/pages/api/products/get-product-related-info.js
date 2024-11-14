// pages/api/products/get-product-related-info.js

import prisma from '@/utils/helpers';
import { getSessionUser } from '@/utils/helpers';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // Retrieve the user session and shopNo
            const user = await getSessionUser(req, res);
            const shopNo = user?.shopNo;

            if (!shopNo) {
                return res.status(401).json({ error: 'Unauthorized: No shopNo found in session.' });
            }

            // Fetch product-related information filtered by shopNo
            const [productTypes, productCategories, colors, sizes, units] = await Promise.all([
                prisma.type.findMany({ where: { shopNo } }),
                prisma.category.findMany({ where: { shopNo } }),
                prisma.colors.findMany({ where: { shopNo } }),
                prisma.sizes.findMany({ where: { shopNo } }),
                prisma.units.findMany({ where: { shopNo } })
            ]);

            return res.status(200).json({
                types: productTypes,
                categories: productCategories,
                colors: colors,
                sizes: sizes,
                units: units
            });
        } catch (error) {
            console.error('Error fetching product-related info:', error);
            return res.status(500).json({ error: 'Failed to fetch product-related information.' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
