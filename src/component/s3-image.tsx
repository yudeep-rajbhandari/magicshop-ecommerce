'use client';

import useSWR from 'swr';

interface SignedImageProps {
  fileKey: string;
  alt?: string;
  // 'product' uses the standard bucket, 'order' uses the private screenshots bucket
  type?: 'product' | 'order';
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch signed URL');
  const data = await res.json();
  return data.url as string;
};

export default function SignedImage({ fileKey, alt = '', type = 'product' }: SignedImageProps) {
  // We include the 'type' in the API call so the backend knows which bucket to use
  const { data: imageUrl, error, isLoading } = useSWR(
      fileKey ? `/api/presigned-url?key=${encodeURIComponent(fileKey)}&type=${type}` : null,
      fetcher,
      {
        refreshInterval: 55 * 60 * 1000, // Revalidate every 55 minutes (assuming 1hr expiry)
        revalidateOnFocus: false,      // Prevent unnecessary fetches when switching tabs
      }
  );

  if (!fileKey) return <div className="p-2 text-gray-400">No image provided</div>;
  if (isLoading) return <p className="animate-pulse">Loading image…</p>;
  if (error) return <p className="text-red-500 text-sm">Failed to load image</p>;

  return (
      <img
          src={imageUrl}
          alt={alt}
          className="rounded-lg shadow-md max-w-full max-h-64 object-contain"
      />
  );
}