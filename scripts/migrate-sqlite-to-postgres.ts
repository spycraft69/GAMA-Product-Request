import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'

type RawRow = Record<string, any>

const SQLITE_DB_PATH = 'prisma/dev.db'

const toDate = (value: unknown): Date | null => {
  if (!value) return null
  return new Date(value as string)
}

const requireDate = (value: unknown, context: string): Date => {
  const parsed = toDate(value)
  if (!parsed) {
    throw new Error(`Expected date value for ${context}, received ${value}`)
  }
  return parsed
}

async function main() {
  const sqlite = new Database(SQLITE_DB_PATH, { readonly: true })
  const prisma = new PrismaClient()

  try {
    const users = sqlite.prepare(`SELECT * FROM "User"`).all() as RawRow[]
    const manufacturers = sqlite.prepare(`SELECT * FROM "Manufacturer"`).all() as RawRow[]
    const genres = sqlite.prepare(`SELECT * FROM "Genre"`).all() as RawRow[]
    const products = sqlite.prepare(`SELECT * FROM "Product"`).all() as RawRow[]
    const productGenres = sqlite.prepare(`SELECT * FROM "ProductGenre"`).all() as RawRow[]
    const requests = sqlite.prepare(`SELECT * FROM "Request"`).all() as RawRow[]
    const sessions = sqlite.prepare(`SELECT * FROM "Session"`).all() as RawRow[]
    const accounts = sqlite.prepare(`SELECT * FROM "Account"`).all() as RawRow[]
    const verificationTokens = sqlite.prepare(`SELECT * FROM "VerificationToken"`).all() as RawRow[]

    console.log('Clearing existing data in Postgres (if any)...')
    await prisma.$transaction([
      prisma.verificationToken.deleteMany(),
      prisma.session.deleteMany(),
      prisma.account.deleteMany(),
      prisma.request.deleteMany(),
      prisma.productGenre.deleteMany(),
      prisma.product.deleteMany(),
      prisma.manufacturer.deleteMany(),
      prisma.genre.deleteMany(),
      prisma.user.deleteMany(),
    ])

    console.log(`Migrating ${users.length} users...`)
    if (users.length) {
      await prisma.user.createMany({
        data: users.map((user) => {
          const createdAt = toDate(user.createdAt)
          const updatedAt = toDate(user.updatedAt)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password,
            role: user.role,
            organization: user.organization,
            ...(createdAt ? { createdAt } : {}),
            ...(updatedAt ? { updatedAt } : {}),
          }
        }),
        skipDuplicates: true,
      })
    }

    console.log(`Migrating ${manufacturers.length} manufacturers...`)
    if (manufacturers.length) {
      await prisma.manufacturer.createMany({
        data: manufacturers.map((manufacturer) => {
          const createdAt = toDate(manufacturer.createdAt)
          const updatedAt = toDate(manufacturer.updatedAt)
          return {
            id: manufacturer.id,
            userId: manufacturer.userId,
            companyName: manufacturer.companyName,
            description: manufacturer.description,
            website: manufacturer.website,
            logoUrl: manufacturer.logoUrl,
            ...(createdAt ? { createdAt } : {}),
            ...(updatedAt ? { updatedAt } : {}),
          }
        }),
        skipDuplicates: true,
      })
    }

    console.log(`Migrating ${genres.length} genres...`)
    if (genres.length) {
      await prisma.genre.createMany({
        data: genres.map((genre) => ({
          id: genre.id,
          name: genre.name,
        })),
        skipDuplicates: true,
      })
    }

    console.log(`Migrating ${products.length} products...`)
    if (products.length) {
      await prisma.product.createMany({
        data: products.map((product) => {
          const createdAt = toDate(product.createdAt)
          const updatedAt = toDate(product.updatedAt)
          return {
            id: product.id,
            manufacturerId: product.manufacturerId,
            name: product.name,
            description: product.description,
            imageUrl: product.imageUrl,
            infoUrl: product.infoUrl,
            minPlayers: product.minPlayers,
            maxPlayers: product.maxPlayers,
            playTime: product.playTime,
            ageRange: product.ageRange,
            ...(product.isAvailable === null || product.isAvailable === undefined
              ? {}
              : { isAvailable: Boolean(product.isAvailable) }),
            ...(createdAt ? { createdAt } : {}),
            ...(updatedAt ? { updatedAt } : {}),
          }
        }),
        skipDuplicates: true,
      })
    }

    console.log(`Migrating ${productGenres.length} product-genre relations...`)
    if (productGenres.length) {
      await prisma.productGenre.createMany({
        data: productGenres.map((relation) => ({
          productId: relation.productId,
          genreId: relation.genreId,
        })),
        skipDuplicates: true,
      })
    }

    console.log(`Migrating ${requests.length} requests...`)
    if (requests.length) {
      await prisma.request.createMany({
        data: requests.map((request) => {
          const createdAt = toDate(request.createdAt)
          const updatedAt = toDate(request.updatedAt)
          const eventDate = toDate(request.eventDate)
          return {
            id: request.id,
            productId: request.productId,
            userId: request.userId ?? undefined,
            status: request.status,
            organizationName: request.organizationName,
            organizationType: request.organizationType,
            contactName: request.contactName,
            contactEmail: request.contactEmail,
            contactPhone: request.contactPhone,
            shippingAddress: request.shippingAddress,
            shippingCity: request.shippingCity,
            shippingState: request.shippingState,
            shippingZip: request.shippingZip,
            shippingCountry: request.shippingCountry,
            ...(eventDate ? { eventDate } : {}),
            ...(request.expectedAttendees === null || request.expectedAttendees === undefined
              ? {}
              : { expectedAttendees: request.expectedAttendees }),
            message: request.message,
            ...(createdAt ? { createdAt } : {}),
            ...(updatedAt ? { updatedAt } : {}),
          }
        }),
        skipDuplicates: true,
      })
    }

    console.log(`Migrating ${sessions.length} sessions...`)
    if (sessions.length) {
      await prisma.session.createMany({
        data: sessions.map((session) => ({
          id: session.id,
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: requireDate(session.expires, `Session.expires (${session.id})`),
        })),
        skipDuplicates: true,
      })
    }

    console.log(`Migrating ${accounts.length} accounts...`)
    if (accounts.length) {
      await prisma.account.createMany({
        data: accounts.map((account) => ({
          id: account.id,
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        })),
        skipDuplicates: true,
      })
    }

    console.log(`Migrating ${verificationTokens.length} verification tokens...`)
    if (verificationTokens.length) {
      await prisma.verificationToken.createMany({
        data: verificationTokens.map((token) => ({
          identifier: token.identifier,
          token: token.token,
          expires: requireDate(token.expires, `VerificationToken.expires (${token.identifier}, ${token.token})`),
        })),
        skipDuplicates: true,
      })
    }

    console.log('Migration complete!')
  } finally {
    await prisma.$disconnect()
    sqlite.close()
  }
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})

