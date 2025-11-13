import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendMail } from '@/lib/mailer'

function mapRequest(request: any) {
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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: { manufacturer: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'MANUFACTURER' && user.manufacturer) {
      const requests = await prisma.request.findMany({
        where: {
          product: {
            manufacturerId: user.manufacturer.id,
          },
        },
        include: {
          product: {
            include: {
              productGenres: { include: { genre: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(requests.map(mapRequest))
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Anonymous requests are allowed - no authentication required
    const body = await request.json()
    const {
      productId,
      organizationName,
      organizationType,
      contactName,
      contactEmail,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
      message
    } = body

    // Validate required fields
    if (!productId || !organizationName || !organizationType || !contactName || !contactEmail || !shippingAddress || !shippingCity || !shippingState || !shippingZip || !shippingCountry) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        manufacturer: {
          include: {
            user: true,
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

    if (!product.isAvailable) {
      return NextResponse.json(
        { error: 'Product is not available for sample product requests' },
        { status: 400 }
      )
    }

    const sampleProductRequest = await prisma.request.create({
      data: {
        productId,
        organizationName,
        organizationType,
        contactName,
        contactEmail,
        contactPhone: null,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        eventDate: null,
        expectedAttendees: null,
        message: message || null,
      }
    })

    const publisherEmail = product.manufacturer?.user?.email

    if (publisherEmail) {
      const productName = product.name
      const subject = `New sample product request for ${productName}`
      const plainText = `A new sample product request has been submitted for ${productName} by ${organizationName} (${organizationType}). Contact: ${contactName} (${contactEmail}).`
      const formattedMessage = message ? message.replace(/\n/g, '<br />') : ''
      const html = `
        <h2>New Sample Product Request</h2>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Organization:</strong> ${organizationName} (${organizationType})</p>
        <p><strong>Contact:</strong> ${contactName} &lt;${contactEmail}&gt;</p>
        <p><strong>Shipping Address:</strong><br />
          ${shippingAddress}<br />
          ${shippingCity}, ${shippingState} ${shippingZip}<br />
          ${shippingCountry}
        </p>
        ${message ? `<p><strong>Message:</strong><br />${formattedMessage}</p>` : ''}
      `

      sendMail({
        to: publisherEmail,
        subject,
        text: plainText,
        html,
      }).catch((error) => {
        console.error('Failed to send notification email:', error)
      })
    }

    return NextResponse.json(sampleProductRequest)
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
