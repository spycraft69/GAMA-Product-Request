import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const publishers = await prisma.manufacturer.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        products: {
          where: {
            isAvailable: true,
            imageUrl: {
              not: null,
            },
          },
          include: {
            productGenres: {
              include: { genre: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        companyName: 'asc',
      },
    })

    const formatted = publishers.map((publisher) => ({
      id: publisher.id,
      companyName: publisher.companyName,
      description: publisher.description,
      website: publisher.website,
      logoUrl: publisher.logoUrl,
      contactName: publisher.user?.name ?? null,
      contactEmail: publisher.user?.email ?? null,
      products: publisher.products.map((product) => ({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        infoUrl: product.infoUrl,
        genres: product.productGenres.map((pg) => pg.genre.name),
      })),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching publishers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
