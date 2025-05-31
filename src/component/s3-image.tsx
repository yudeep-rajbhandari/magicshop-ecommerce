'use client';

import useSWR from 'swr';

interface SignedImageProps {
  fileKey: string;
  alt?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch signed URL');
  const data = await res.json();
  return data.url as string;
};

export default function SignedImage({ fileKey, alt = '' }: SignedImageProps) {
  const { data: imageUrl, error, isLoading } = useSWR(
    `/api/presigned-url?key=${encodeURIComponent(fileKey)}`,
    fetcher,
    {
      refreshInterval: 55000, // Optional: revalidate every 55s if the signed URL expires in 60s
    }
  );

  if (isLoading) return <p>Loading image…</p>;
  if (error) return <p>Failed to load image</p>;

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="rounded-lg shadow-md max-w-full"
    />
  );
}