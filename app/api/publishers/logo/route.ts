import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { saveFile } from '@/lib/upload'

function formatProfileResponse(user: {
  name: string
  email: string
  manufacturer: {
    companyName: string
    description: string | null
    website: string | null
    logoUrl: string | null
  }
}) {
  return {
    companyName: user.manufacturer.companyName,
    description: user.manufacturer.description,
    website: user.manufacturer.website,
    logoUrl: user.manufacturer.logoUrl,
    contactName: user.name,
    contactEmail: user.email,
  }
}

export const runtime = 'nodejs'

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
    const logoFile = formData.get('logo') as File | null

    if (!logoFile || logoFile.size === 0) {
      return NextResponse.json(
        { error: 'Logo file is required' },
        { status: 400 }
      )
    }

    const logoUrl = await saveFile(logoFile, 'logos')

    await prisma.manufacturer.update({
      where: { id: user.manufacturer.id },
      data: {
        logoUrl,
      },
    })

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { manufacturer: true },
    })

    if (!updatedUser || !updatedUser.manufacturer) {
      throw new Error('Failed to reload updated profile')
    }

    return NextResponse.json(formatProfileResponse(updatedUser))
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
