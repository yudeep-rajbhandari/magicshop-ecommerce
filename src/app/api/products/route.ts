import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
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