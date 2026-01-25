"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Updates the promotion status of a category in the database.
 * @param id - The ID of the category to update.
 * @param hasPromo - The new promotion status.
 */
export async function toggleCategoryPromo(id: string, hasPromo: boolean) {
    try {
        await prisma.category.update({
            where: { id },
            data: { hasPromo },
        });

        // Revalidate the cache for the view page to show the updated data
        revalidatePath("/admin/category/view");

    } catch (error) {
        // In a real-world app, you'd want more robust error handling
        console.error("Failed to update category promotion status:", error);
        throw new Error("Failed to update category.");
    }
}