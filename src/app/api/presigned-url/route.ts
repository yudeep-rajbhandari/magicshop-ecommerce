// app/api/presigned-url/route.ts (Next.js API Route)
import {generatePresignedUrl, preSignedUrl} from '@/lib/upload';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const key = searchParams.get('key');
    const type = searchParams.get('type'); // 'product' or 'order'

    // 1. Validate the key exists
    if (!key) {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    // 2. Select the bucket based on the 'type' param
    const bucketName = type === 'order'
        ? process.env.SUPABASE_BUCKET_NAME_ORDER
        : process.env.SUPABASE_BUCKET_NAME;

    if (!bucketName) {
      console.error("Bucket configuration missing for type:", type);
      return NextResponse.json({ error: 'Bucket configuration error' }, { status: 500 });
    }

    // 3. Generate the URL
    const url = await generatePresignedUrl(bucketName, key);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('S3 Presigned URL Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}