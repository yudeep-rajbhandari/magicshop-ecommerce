import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    const products = await prisma.product.findMany()

    const signedProducts = await Promise.all(
        products.map(async (product) => {
            const { data } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET_NAME!) //your Supabase bucket name
                .createSignedUrl(product.imageUrl, 60 * 60) // 1 hour expiry

            return {
                ...product,
                imageUrl: data?.signedUrl ?? null,
            }
        })
    )
    return NextResponse.json(signedProducts)
}

export async function POST(req: Request) {
    const body = await req.json();
    const product = await prisma.product.create({
        data: {
            name: body.name,
            description: body.description,
            price: body.price,
            imageUrl: body.imageUrl,
        },
    });
    return NextResponse.json(product);
}

export async function PUT(req: Request) {
    const body = await req.json();
    const product = await prisma.product.update({
        where: { id: body.id },
        data: {
            name: body.name,
            description: body.description,
            price: body.price,
            imageUrl: body.imageUrl,
        },
    });
    return NextResponse.json(product);
}

export async function DELETE(req: Request) {
    const body = await req.json();
    const deleted = await prisma.product.delete({
        where: { id: body.id },
    });
    return NextResponse.json(deleted);
}