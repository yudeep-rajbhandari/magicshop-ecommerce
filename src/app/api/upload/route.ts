import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

const s3 = new S3Client({
    endpoint: process.env.SUPABASE_S3_ENDPOINT, // e.g. https://xyz.supabase.co/storage/v1
    region: 'us-east-2', // or omit if not required
    credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY!,
        secretAccessKey: process.env.SUPABASE_SECRET_KEY!,
    },
    forcePathStyle: true, // important for S3-compatible endpoints like Supabase
});

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const key = `products/${randomUUID()}-${file.name}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: process.env.SUPABASE_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        })
    );

    // Supabase storage URL pattern for public files:
    const imageUrl = key;

    return NextResponse.json({ imageUrl });
}
