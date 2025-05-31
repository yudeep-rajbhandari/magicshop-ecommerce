// app/api/presigned-url/route.ts (Next.js API Route)
import { preSignedUrl } from '@/lib/upload';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  const url = await preSignedUrl(process.env.AWS_BUCKET_NAME!, key);

  return NextResponse.json({ url });
}
