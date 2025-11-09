import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function formatProfileResponse(user: {
  name: string
  email: string
  manufacturer: {
      companyName: string
      description: string | null
      website: string | null
      logoUrl: string | null
    } | null
}) {
  if (!user.manufacturer) {
    throw new Error('Manufacturer profile is missing')
  }

  return {
    companyName: user.manufacturer.companyName,
    description: user.manufacturer.description,
    website: user.manufacturer.website,
    logoUrl: user.manufacturer.logoUrl,
    contactName: user.name,
    contactEmail: user.email,
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

    return NextResponse.json(formatProfileResponse(user))
  } catch (error) {
    console.error('Error fetching publisher profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
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

    const body = await request.json()
    const companyName = body.companyName?.toString().trim()
    const contactName = body.contactName?.toString().trim()
    const description = body.description?.toString().trim() || null
    const website = body.website?.toString().trim() || null

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    if (!contactName) {
      return NextResponse.json(
        { error: 'Contact name is required' },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { name: contactName },
      }),
      prisma.manufacturer.update({
        where: { id: user.manufacturer.id },
        data: {
          companyName,
          description,
          website,
        },
      }),
    ])

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { manufacturer: true },
    })

    if (!updatedUser || !updatedUser.manufacturer) {
      throw new Error('Failed to reload updated profile')
    }

    return NextResponse.json(formatProfileResponse(updatedUser))
  } catch (error) {
    console.error('Error updating publisher profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
