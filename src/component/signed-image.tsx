'use client';

import useSWR from 'swr';

interface SignedImageProps {
    fileKey: string;
    alt?: string;
    type?: 'product' | 'order';
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch signed URL');
    const data = await res.json();
    return data.url as string;
};

export default function SignedImage({ fileKey, alt = '', type = 'product' }: SignedImageProps) {
    const { data: imageUrl, error, isLoading } = useSWR(
        fileKey ? `/api/presigned-url?key=${encodeURIComponent(fileKey)}&type=${type}` : null,
        fetcher,
        {
            refreshInterval: 55 * 60 * 1000,
            revalidateOnFocus: false,
        }
    );

    if (!fileKey) return <div className="p-2 text-gray-400 text-xs">No image provided</div>;
    if (isLoading) return <p className="text-xs animate-pulse">Loading image...</p>;
    if (error) return <p className="text-red-500 text-xs">Failed to load</p>;

    return (
        <img
            src={imageUrl}
            alt={alt}
            className="rounded-lg shadow-sm max-w-full h-auto object-contain block mx-auto"
        />
    );
}