"use server";

import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/upload";
import { revalidatePath } from "next/cache";

export const saveProduct = async (_prevState: any, formData: FormData) => {
  const file = formData.get("imageUrl") as File;
  let imageUrl = "";

  // 1. Handle Image Upload
  if (file && file.size > 0) {
    imageUrl = await uploadImage(file, process.env.SUPABASE_BUCKET_NAME!);
  }

  // 2. Extract Data including the new categoryId
  const rawData = {
    name: formData.get("name")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    price: Number(formData.get("price") || 0),
    imageUrl: imageUrl || "",
    categoryId: formData.get("categoryId")?.toString() || "", // New Field
  };

  // Basic Validation
  if (!rawData.categoryId) {
    return {
      success: false,
      message: "Please select a category.",
      inputs: rawData,
    };
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: rawData.name,
        description: rawData.description,
        price: rawData.price,
        imageUrl: rawData.imageUrl,
        // Connect the product to the existing category ID
        categoryId: rawData.categoryId,
      },
    });

    // Refresh the products list to show the new item
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product saved successfully",
      inputs: product,
    };
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return {
      success: false,
      message: `Error saving product: ${error.message}`,
      inputs: rawData,
    };
  }
};