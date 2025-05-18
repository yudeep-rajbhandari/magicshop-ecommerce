import { randomUUID } from "crypto";
import { getS3Client } from "./s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSupabaseClient } from "./supabase";

export async function uploadImage(file: File, bucketName: string) {
  if (!file) throw new Error("No file provided");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const key = `products/${randomUUID()}-${file.name}`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });
  const s3 = getS3Client();
  await s3.send(command);
  return key;
}

export async function preSignedUrl(bucketName: string, key: string) {
  const { data, error } = await getSupabaseClient()
    .storage.from(bucketName) //your Supabase bucket name
    .createSignedUrl(key, 60 * 60); // 1 hour expiry

  if (error) {
    console.error("Error creating signed URL:", error);
    throw new Error("Error creating signed URL");
  }
  return data?.signedUrl ?? null;
}
