import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function mapRequest(request: any) {
  if (!request) return null
  const { product, ...rest } = request
  return {
    ...rest,
    product: {
      ...product,
      infoUrl: product?.infoUrl ?? null,
      genres: product?.productGenres?.map((pg: any) => pg.genre.name) ?? [],
    },
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestRecord = await prisma.request.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            productGenres: { include: { genre: true } },
            manufacturer: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    })

    if (!requestRecord) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(mapRequest(requestRecord))
  } catch (error) {
    console.error('Error fetching request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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

    const body = await req.json()
    const { status } = body

    const existingRequest = await prisma.request.findUnique({
      where: { id },
      include: {
        product: true,
      },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (existingRequest.product.manufacturerId !== user.manufacturer.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: { status },
      include: {
        product: {
          include: {
            productGenres: { include: { genre: true } },
            manufacturer: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(mapRequest(updatedRequest))
  } catch (error) {
    console.error('Error updating request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
