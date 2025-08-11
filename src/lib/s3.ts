import { S3Client } from '@aws-sdk/client-s3';

let _s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: 'us-east-2', // Supabase uses 'us-east-1' for compatibility
      endpoint: process.env.SUPABASE_S3_ENDPOINT, // e.g. https://<project-ref>.supabase.co/storage/v1
      credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY!,    // from your Supabase project
        secretAccessKey: process.env.SUPABASE_SECRET_KEY!,
      },
      forcePathStyle: true,   // Important for S3-compatible storage like Supabase
    });
  }
  return _s3Client;
}
