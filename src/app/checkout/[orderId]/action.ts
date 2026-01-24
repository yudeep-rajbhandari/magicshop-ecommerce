"use server";

import { prisma } from "@/lib/prisma";
import { getActivePromoMap } from "@/app/lib/actions/get-promos";
import { revalidatePath } from "next/cache";
import {uploadImage} from "@/lib/upload";

// src/app/checkout/[orderId]/action.ts

export async function finalizeCheckout(orderId: string, cartItems: any[]) {
    const promos = await getActivePromoMap();

    // 1. Group items by category to check for volume discounts
    const counts: Record<string, number> = {};
    cartItems.forEach((item) => {
        counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    });

    let subtotal = 0;
    let totalDiscount = 0;

    // 2. Map items to Prisma's creation format
    const itemData = cartItems.map((item) => {
        const price = item.price || 0;
        subtotal += price;

        const rule = promos[item.categoryId];
        let discountForThisItem = 0;

        // Apply discount logic
        if (rule && counts[item.categoryId] >= rule.min) {
            discountForThisItem = price * rule.rate;
        }

        totalDiscount += discountForThisItem;

        return {
            productId: item.id,
            quantity: 1, // Or item.quantity if you have a qty selector
            priceAtPurchase: price - discountForThisItem, // The final price the user pays
            discountApplied: discountForThisItem,         // The amount saved
        };
    });

    const finalTotal = subtotal - totalDiscount;

    // 3. Update Order and Create Items in one transaction
    await prisma.$transaction([
        // Delete any existing items (in case of a retry/refresh)
        prisma.orderItem.deleteMany({ where: { orderId } }),

        // Create new discounted items and update order total
        prisma.order.update({
            where: { id: orderId },
            data: {
                totalAmount: finalTotal,
                status: "SUBMITTED",
                items: {
                    create: itemData
                }
            }
        })
    ]);

    revalidatePath(`/checkout/${orderId}`);
    return { success: true, finalTotal };
}
export async function submitPaymentProof(formData: FormData) {
    const orderId = formData.get("orderId") as string;

    // Extracting fields based on YOUR schema names
    const name = formData.get("name") as string;
    const phone = formData.get("phone") ? parseInt(formData.get("phone") as string) : null;
    const address = formData.get("address") as string;
    const email = formData.get("email") as string;
    const file = formData.get("file") as File; // This name comes from your input field in PaymentForm

    let screenshotUrl = "";

    try {
        // 1. Upload to Supabase
        if (file && file.size > 0) {
            screenshotUrl = await uploadImage(file, process.env.SUPABASE_BUCKET_NAME_ORDER!);
        }

        // 2. Update Order using your specific schema fields
        await prisma.order.update({
            where: { id: orderId },
            data: {
                clientName: name,
                phone: phone,
                clientAddress: address,
                clientEmail: email,
                paymentScreenshot: screenshotUrl, // Matches your schema
                status: "SUBMITTED", // Or your OrderStatus enum value
            },
        });

        revalidatePath(`/checkout/${orderId}`);
        return { success: true, message: "Payment info submitted!" };
    } catch (error: any) {
        console.error("Database Update Error:", error);
        return { success: false, message: "Submission failed: " + error.message };
    }
}

export async function checkOrderStatus(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true }
    });
    return order?.status === "SUBMITTED";
}
