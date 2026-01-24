"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, newStatus: any) {
    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus }
    });
    revalidatePath(`/admin/order/view/${orderId}`);
    revalidatePath("/admin/order/view");
}

export async function updateOrderRemainingAmount(orderId: string, remainingAmount: any) {
    await prisma.order.update({
        where: { id: orderId },
        data: { remainingAmount: remainingAmount }
    });
    revalidatePath(`/admin/order/view/${orderId}`);
    revalidatePath("/admin/order/view");
}