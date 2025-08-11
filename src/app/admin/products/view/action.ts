// actions.ts
"use server";

import { prisma } from '@/lib/prisma';


export async function viewProducts() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
    });

    // Map over products and replace imageUrl with presigned URL

    return products;
}

export async function deleteProduct(SKU: string) {
    try {
        await prisma.product.delete({
            where: {
                id: SKU,
            },
        });
        console.log(`Product with id ${SKU} deleted successfully.`);
    } catch (error) {
        console.error("Error deleting product:", error);
    }
}
