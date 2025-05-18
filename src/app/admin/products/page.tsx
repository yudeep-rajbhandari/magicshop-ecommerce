"use client";

import { useActionState } from "react";
import { saveProduct } from "./action";

type Product = {
  name: string;
  description: string;
  price: number;
  image: File | null;
};

const initialState = {
  success: false,
  message: "",
  inputs: {} as any,
};

export default function ProductsPage() {
  const [state, formAction, pending] = useActionState(
    saveProduct,
    initialState
  );
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>

      <div className="mb-6 space-y-2">
        <form className="flex flex-col space-y-2" action={formAction}>
          <input
            name="name"
            placeholder="Name"
            className="border p-2 w-full"
            defaultValue={state?.inputs?.name}
          />
          <input
            name="description"
            placeholder="Description"
            className="border p-2 w-full"
            defaultValue={state?.inputs?.description}
          />
          <input
            name="price"
            placeholder="Price"
            className="border p-2 w-full"
            type='number'
            defaultValue={state?.inputs?.price} 
          />
          <input
            name="imageUrl"
            placeholder="Image URL"
            className="border p-2 w-full"
            type="file"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded" disabled={pending}>
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}
