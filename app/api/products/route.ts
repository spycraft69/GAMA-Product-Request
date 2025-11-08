import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function mapProduct(product: any) {
  if (!product) return null
  const { productGenres, infoUrl, ...rest } = product
  return {
    ...rest,
    infoUrl: infoUrl ?? null,
    genres: productGenres?.map((pg: any) => pg.genre.name) ?? [],
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        manufacturer: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
          },
        },
        productGenres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(products.map(mapProduct).filter(Boolean))
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

