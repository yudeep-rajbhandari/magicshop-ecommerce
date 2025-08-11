import { randomUUID } from "crypto";
import { getS3Client } from "./s3";
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import { getSupabaseClient } from "./supabase";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export async function uploadImage(file: File, bucketName: string) {
  if (!file) throw new Error("No file provided");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const key = `${randomUUID()}-${replaceSpaces(file.name).trim()}`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });
  const s3 = getS3Client();
  await s3.send(command);
  console.log("Image uploaded to S3",key);
  return key;
}

export async function preSignedUrl(bucketName: string, key: string) {
  if (!bucketName) throw new Error("Bucket name is required");
  if (!key) throw new Error("File key is required");

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(key, 60 * 60); // 1 hour expiry



  if (error) {
    console.error("Error creating signed URL:", error.message);
    throw new Error(`Error creating signed URL: ${error.message}`);
  }

  if (!data?.signedUrl) {
    throw new Error("Signed URL not returned by Supabase");
  }

  return data.signedUrl;
}

function replaceSpaces(fileName: string, replaceWith: string = "_"): string {
  return fileName.replace(/\s+/g, replaceWith).trim();
}


export async function generatePresignedUrl(bucketName: string, key: string) {

  const s3 = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });


  // URL valid for 1 hour (3600 seconds)
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
}

