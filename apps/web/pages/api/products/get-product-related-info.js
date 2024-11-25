// pages/api/products/get-product-related-info.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // Retrieve the session using getServerSession
            const session = await getServerSession(req, res, authOptions);
            const shopNo = session?.user?.shopNo;

            if (!shopNo) {
                return res.status(401).json({ error: 'Unauthorized: No shopNo found in session.' });
            }

            // Fetch product-related information filtered by shopNo
            const productTypes = await prisma.type.findMany({ where: { shopNo } });
            const productCategories = await prisma.category.findMany({ where: { shopNo } });
            const tags = await prisma.tags.findMany({ where: { shopNo } });
            const colors = await prisma.colors.findMany({ where: { shopNo } });
            const sizes = await prisma.sizes.findMany({ where: { shopNo } });
            const units = await prisma.units.findMany({ where: { shopNo } });            

            return res.status(200).json({
                types: productTypes,
                categories: productCategories,
                tags: tags,
                colors: colors,
                sizes: sizes,
                units: units
            });
        } 
        catch (error) {
            console.error('Error fetching product-related info:', error);
            return res.status(500).json({ error: 'Failed to fetch product-related information.' });
        }
    } 
    else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
