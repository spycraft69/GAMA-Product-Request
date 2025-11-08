import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const product = await prisma.product.findUnique({
      where: { id },
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
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const { productGenres, ...rest } = product
    return NextResponse.json({
      ...rest,
      infoUrl: rest.infoUrl ?? null,
      genres: productGenres?.map((pg) => pg.genre.name) ?? [],
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

