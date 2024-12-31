// pages/api/products/get-product-related-info.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // Retrieve the session using getServerSession
            const session = await getServerSession(req, res, authOptions);
            const shopId = session?.user?.shopId;

            if (!shopId) {
                return res.status(401).json({ error: 'Unauthorized: No shopId found in session.' });
            }

            // Fetch product-related information filtered by shopId
            const productTypes = await prisma.type.findMany({ where: { shopId } });
            const productCategories = await prisma.category.findMany({ where: { shopId } });
            const tags = await prisma.tag.findMany({ where: { shopId } });
            const colors = await prisma.color.findMany({ where: { shopId } });
            const sizes = await prisma.size.findMany({ where: { shopId } });       

            return res.status(200).json({
                types: productTypes,
                categories: productCategories,
                tags: tags,
                colors: colors,
                sizes: sizes,
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
