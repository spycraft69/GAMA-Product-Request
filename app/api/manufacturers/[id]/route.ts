import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!manufacturer) {
      return NextResponse.json(
        { error: 'Manufacturer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(manufacturer)
  } catch (error) {
    console.error('Error fetching manufacturer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

