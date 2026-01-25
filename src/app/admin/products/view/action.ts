"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Resend } from 'resend';

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

interface EmailResponse {
    success: boolean;
    message: string;
}

export async function sendLinkByEmail(email: string, link: string): Promise<EmailResponse> {
    console.log(`Preparing to send link: ${link} to email: ${email}`);
    const resend = new Resend(process.env.RESEND_API_KEY);
    // Basic validation
    if (!email || !link) {
        return { success: false, message: "Email and link are required." };
    }

    try {
        // --- Placeholder for your email service ---
        // Replace this with your actual email sending logic.
        // For example, using Resend:
        const qrData = encodeURIComponent(`https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&`);
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
        const { data, error } = await resend.emails.send({
            from: 'hello@yudeeprajbhandari.com.np',
            to: email,
            subject: 'A link from our store, just for you!',
            html: `<p>Hello!</p>
                    <p>Please pay us via our Esewa ID and upload it to form in the link below</p>
                   <p>Here is the special link you requested:</p>
                   <p><a href="${link}">${link}</a></p>
                   <img src="${qrCodeUrl}" alt="Order QR Code" width="150" height="150" />
                   <p>Thank you,</p>
                   <p>Your Store Team</p>`,
        });

      if(!error){

        return { success: true, message: `Link successfully sent to ${email}.` };
        }
    else {
        return { success: false, message: `Something went wrong: ${error.message}` }; };

    }
        // This is a dummy success response for demonstration purposes.
        // In a real implementation, the success of the 'resend' call would determine this.
    catch (error) {
        console.error("Email sending failed:", error);
        return { success: false, message: "An error occurred while sending the email." };
    }
}
