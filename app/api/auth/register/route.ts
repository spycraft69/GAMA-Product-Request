import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role, organization, companyName, website } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        organization: role !== 'MANUFACTURER' ? organization : null,
      }
    })

    // If manufacturer, create manufacturer profile
    if (role === 'MANUFACTURER') {
      await prisma.manufacturer.create({
        data: {
          userId: user.id,
          companyName,
          website: website || null,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

