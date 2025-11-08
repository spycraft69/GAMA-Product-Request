import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        companyName: 'asc',
      },
    })

    return NextResponse.json(manufacturers)
  } catch (error) {
    console.error('Error fetching manufacturers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

