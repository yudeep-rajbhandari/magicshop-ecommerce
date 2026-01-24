"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Fetch all products with their associated category data
 */
export async function viewProducts() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                category: true, // Crucial for showing category names & promo logic
            },
        });
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

/**
 * Delete a product by its ID
 */
export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({
            where: { id },
        });

        // Refresh the page data
        revalidatePath("/admin/products/view");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting product:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create Order Action with Server-Side Discount Logic
 */
export async function createOrderAction(cartItems: any[]) {
    // 1. Fetch fresh product data from DB to prevent price tampering
    const productIds = cartItems.map(item => item.id);
    const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { category: true }
    });

    // 2. Re-construct the cart with DB data
    const validCart = cartItems.map(clientItem => {
        const dbProduct = dbProducts.find(p => p.id === clientItem.id);
        if (!dbProduct) throw new Error(`Product ${clientItem.id} not found`);
        return { ...dbProduct };
    });

    // 3. Calculate Category Counts
    const categoryCounts: Record<string, number> = {};
    validCart.forEach((item) => {
        const catId = item.categoryId || "unknown";
        categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
    });

    // 4. Calculate Final Prices & Create Order Items
    let orderTotal = 0;

    const orderItemsData = validCart.map((item) => {
        const promo = item.category;
        const catId = item.categoryId || "unknown";
        let finalPrice = item.price;
        let discountApplied = 0;

        // Apply Discount Rule
        if (
            promo?.hasPromo &&
            promo.minQuantity &&
            promo.discountRate &&
            categoryCounts[catId] >= promo.minQuantity
        ) {
            discountApplied = item.price * promo.discountRate;
            finalPrice = item.price - discountApplied;
        }

        orderTotal += finalPrice;

        return {
            product: { connect: { id: item.id } },
            quantity: 1,
            priceAtPurchase: finalPrice,
            discountApplied: discountApplied,
        };
    });

    // 5. Save to Database
    try {
        const newOrder = await prisma.order.create({
            data: {
                totalAmount: orderTotal,
                status: "PENDING",
                items: {
                    create: orderItemsData
                }
            }
        });

        return { success: true, orderId: newOrder.id };
    } catch (err) {
        console.error("Order Creation Failed:", err);
        return { success: false, error: "Failed to create order" };
    }
}