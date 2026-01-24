"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
    const name = formData.get("name") as string;
    const hasPromo = formData.get("hasPromo") === "on";
    const minQuantity = formData.get("minQuantity") ? parseInt(formData.get("minQuantity") as string) : null;
    const discountRate = formData.get("discountRate") ? parseFloat(formData.get("discountRate") as string) / 100 : null;

    await prisma.category.create({
        data: {
            name,
            hasPromo,
            minQuantity,
            discountRate,
        },
    });

    revalidatePath("/admin/products/add"); // Refresh the product form dropdown
    revalidatePath("/admin/categories");
}