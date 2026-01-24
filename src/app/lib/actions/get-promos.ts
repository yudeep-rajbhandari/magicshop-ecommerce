import { prisma } from "@/lib/prisma";

export async function getActivePromoMap() {
    // Fetch only categories that have an active promo
    const categoriesWithPromos = await prisma.category.findMany({
        where: { hasPromo: true }
    });

    const promoMap: Record<string, { min: number; rate: number }> = {};

    categoriesWithPromos.forEach(cat => {
        // Ensure the optional fields exist before adding to map
        if (cat.minQuantity !== null && cat.discountRate !== null) {
            promoMap[cat.id] = {
                min: cat.minQuantity,
                rate: cat.discountRate
            };
        }
    });

    return promoMap;
}