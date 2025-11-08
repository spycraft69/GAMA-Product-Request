import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { saveFile } from '@/lib/upload'

export const runtime = 'nodejs'

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
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: { manufacturer: true },
    })

    if (!user || user.role !== 'MANUFACTURER' || !user.manufacturer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const products = await prisma.product.findMany({
      where: {
        manufacturerId: user.manufacturer.id,
      },
      include: {
        _count: {
          select: { requests: true },
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: { manufacturer: true },
    })

    if (!user || user.role !== 'MANUFACTURER' || !user.manufacturer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()

    const name = formData.get('name')?.toString().trim()
    if (!name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    const description = formData.get('description')?.toString().trim() || null
    const genreValues = formData
      .getAll('genres')
      .map((value) => value.toString().trim())
      .filter((value) => value.length > 0)

    const playTime = formData.get('playTime')?.toString().trim() || null
    const ageRange = formData.get('ageRange')?.toString().trim() || null
    const infoUrl = formData.get('infoUrl')?.toString().trim() || null

    const minPlayersRaw = formData.get('minPlayers')?.toString().trim()
    const maxPlayersRaw = formData.get('maxPlayers')?.toString().trim()

    const minPlayers = minPlayersRaw ? parseInt(minPlayersRaw, 10) : null
    const maxPlayers = maxPlayersRaw ? parseInt(maxPlayersRaw, 10) : null

    const isAvailable = formData.get('isAvailable') === 'on'

    let imageUrl = null as string | null
    const imageFile = formData.get('image') as File | null

    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveFile(imageFile, 'products')
    }

    const product = await prisma.$transaction(async (tx) => {
      const productRecord = await tx.product.create({
        data: {
          manufacturerId: user.manufacturer!.id,
          name,
          description,
          imageUrl,
          infoUrl,
          minPlayers,
          maxPlayers,
          playTime,
          ageRange,
          isAvailable,
        },
      })

      if (genreValues.length > 0) {
        const genres = await Promise.all(
          genreValues.map((genreName) =>
            tx.genre.upsert({
              where: { name: genreName },
              update: {},
              create: { name: genreName },
            })
          )
        )

        await tx.productGenre.createMany({
          data: genres.map((genre) => ({
            productId: productRecord.id,
            genreId: genre.id,
          })),
        })
      }

      const reloaded = await tx.product.findUnique({
        where: { id: productRecord.id },
        include: {
          _count: {
            select: { requests: true },
          },
          productGenres: {
            include: { genre: true },
          },
        },
      })

      if (!reloaded) {
        throw new Error('Failed to load created product')
      }

      return reloaded
    })

    return NextResponse.json(mapProduct(product))
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

