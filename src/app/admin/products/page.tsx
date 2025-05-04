'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { ChangeEvent } from 'react';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
};

export default function ProductsPage() {
    const { data, error, mutate, isLoading } = useSWR('/api/products', fetcher);
    const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '' });
    // eslint-disable-next-line
    const [imageError, setImageError] = useState<boolean>(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.name,
                description: form.description,
                price: parseFloat(form.price),
                imageUrl: form.imageUrl,
            }),
        });
        setForm({ name: '', description: '', price: '', imageUrl: '' });
        mutate();
    };

    const handleDelete = async (id: number) => {
        await fetch('/api/products', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        mutate();
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
            // eslint-disable-next-line
        } catch (e) {
            return false;
        }
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading products</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Product List</h1>

            <div className="mb-6 space-y-2">
                <input name="name" placeholder="Name" onChange={handleChange} value={form.name} className="border p-2 w-full" />
                <input name="description" placeholder="Description" onChange={handleChange} value={form.description} className="border p-2 w-full" />
                <input name="price" placeholder="Price" onChange={handleChange} value={form.price} className="border p-2 w-full" />
                <input name="imageUrl" placeholder="Image URL" onChange={handleChange} value={form.imageUrl} className="border p-2 w-full" />
                <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">Add Product</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((product: Product) => (
                    <div key={product.id} className="border rounded-xl p-4 shadow relative">
                        <div className="w-full h-40">
                            <Image
                                src={isValidUrl(product.imageUrl) ? product.imageUrl : '/vercel.svg'} // Validate the URL before rendering
                                alt={product.name}
                                width={400}
                                height={160}
                                className="w-full h-full object-cover rounded-md"
                                onError={handleImageError} // Trigger error handler when image fails to load
                            />
                        </div>
                        <h2 className="text-xl font-semibold mt-2">{product.name}</h2>
                        <p className="text-gray-600">{product.description}</p>
                        <p className="text-lg font-bold mt-2">${product.price.toFixed(2)}</p>
                        <button onClick={() => handleDelete(product.id)} className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-sm rounded">Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
