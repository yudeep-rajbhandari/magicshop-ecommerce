"use server";

import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/upload";

export const saveProduct = async (_prevState: any, formData: FormData) => {
  const file = formData.get("file") as File;
  let imageUrl = "";
  if (file){
    imageUrl= await uploadImage(file, process.env.SUPABASE_BUCKET_NAME!);
  }

  const rawData = {
    name: formData.get("name")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    price: Number(formData.get("price") || 0),
    imageUrl: imageUrl || "",
  };
  try {
    const product = await prisma.product.create({
      data: {
        ...rawData,
      },
    });

    return {
      success: true,
      message: "Product saved successfully",
      inputs: product,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error saving product: ${error.message}`,
      inputs: rawData,
    };
  }
};
