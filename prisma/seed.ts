import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create first publisher
  const hashedPassword1 = await bcrypt.hash('password123', 10)
  const publisher1 = await prisma.user.create({
    data: {
      email: 'fantasygames@example.com',
      name: 'Fantasy Games Publishing',
      password: hashedPassword1,
      role: 'MANUFACTURER',
      manufacturer: {
        create: {
          companyName: 'Fantasy Games Publishing',
          description: 'We create immersive fantasy tabletop games for all ages.',
          website: 'https://fantasygames.example.com',
          logoUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
        },
      },
    },
    include: { manufacturer: true },
  })

  // Create products for publisher 1
  const products1 = [
    {
      name: 'Dragon Quest: The Realm',
      description: 'Embark on an epic adventure in a world of dragons, magic, and heroes. Perfect for 2-4 players, ages 10+.',
      imageUrl: 'https://images.unsplash.com/photo-1606166188517-4a72cb8105d5?w=800&h=600&fit=crop',
      infoUrl: 'https://example.com/dragon-quest',
      genres: ['Adventure', 'Fantasy'],
      minPlayers: 2,
      maxPlayers: 4,
      playTime: '60-90 min',
      ageRange: '10+',
      isAvailable: true,
    },
    {
      name: "Wizard's Tower",
      description: 'Build your magical tower and cast powerful spells to outwit your opponents. Strategic gameplay for 2-5 players.',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      infoUrl: 'https://example.com/wizards-tower',
      genres: ['Strategy', 'Fantasy'],
      minPlayers: 2,
      maxPlayers: 5,
      playTime: '45-60 min',
      ageRange: '12+',
      isAvailable: true,
    },
    {
      name: 'Medieval Kingdoms',
      description: 'Rule your kingdom, manage resources, and expand your territory in this engaging strategy game.',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
      infoUrl: 'https://example.com/medieval-kingdoms',
      genres: ['Resource Management', 'Strategy'],
      minPlayers: 3,
      maxPlayers: 6,
      playTime: '90-120 min',
      ageRange: '14+',
      isAvailable: true,
    },
    {
      name: 'Enchanted Forest',
      description: 'Explore a magical forest filled with mystical creatures and hidden treasures. Family-friendly adventure game.',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      infoUrl: 'https://example.com/enchanted-forest',
      genres: ['Family', 'Adventure'],
      minPlayers: 2,
      maxPlayers: 4,
      playTime: '30-45 min',
      ageRange: '8+',
      isAvailable: true,
    },
    {
      name: 'Battle of Legends',
      description: 'Command legendary heroes in epic battles. Fast-paced combat game with unique character abilities.',
      imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop',
      infoUrl: 'https://example.com/battle-of-legends',
      genres: ['Combat', 'Strategy'],
      minPlayers: 2,
      maxPlayers: 4,
      playTime: '45-60 min',
      ageRange: '10+',
      isAvailable: true,
    },
  ]

  for (const product of products1) {
    await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          manufacturerId: publisher1.manufacturer!.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          infoUrl: product.infoUrl,
          minPlayers: product.minPlayers,
          maxPlayers: product.maxPlayers,
          playTime: product.playTime,
          ageRange: product.ageRange,
          isAvailable: product.isAvailable,
        },
      })

      const genres = await Promise.all(
        product.genres.map((genreName) =>
          tx.genre.upsert({
            where: { name: genreName },
            update: {},
            create: { name: genreName },
          })
        )
      )

      await tx.productGenre.createMany({
        data: genres.map((genre) => ({
          productId: createdProduct.id,
          genreId: genre.id,
        })),
      })
    })
  }

  console.log('Created publisher 1 with 5 products')

  // Create second publisher
  const hashedPassword2 = await bcrypt.hash('password123', 10)
  const publisher2 = await prisma.user.create({
    data: {
      email: 'scifigames@example.com',
      name: 'Sci-Fi Games Co.',
      password: hashedPassword2,
      role: 'MANUFACTURER',
      manufacturer: {
        create: {
          companyName: 'Sci-Fi Games Co.',
          description: 'Innovative science fiction tabletop games for the modern gamer.',
          website: 'https://scifigames.example.com',
          logoUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=200&h=200&fit=crop',
        },
      },
    },
    include: { manufacturer: true },
  })

  // Create products for publisher 2
  const products2 = [
    {
      name: 'Space Station Alpha',
      description: 'Manage a space station, research new technologies, and explore the galaxy. Cooperative gameplay for 1-4 players.',
      imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop',
      infoUrl: 'https://example.com/space-station-alpha',
      genres: ['Cooperative', 'Sci-Fi'],
      minPlayers: 1,
      maxPlayers: 4,
      playTime: '60-90 min',
      ageRange: '12+',
      isAvailable: true,
    },
    {
      name: 'Cyberpunk City',
      description: 'Navigate a futuristic city, hack systems, and complete missions in this cyberpunk-themed adventure.',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
      infoUrl: 'https://example.com/cyberpunk-city',
      genres: ['Sci-Fi', 'Strategy'],
      minPlayers: 2,
      maxPlayers: 5,
      playTime: '75-90 min',
      ageRange: '14+',
      isAvailable: true,
    },
    {
      name: 'Alien Encounter',
      description: 'First contact with alien species! Negotiate, trade, or battle in this diplomatic strategy game.',
      imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop',
      infoUrl: 'https://example.com/alien-encounter',
      genres: ['Negotiation', 'Sci-Fi'],
      minPlayers: 3,
      maxPlayers: 6,
      playTime: '90-120 min',
      ageRange: '13+',
      isAvailable: true,
    },
    {
      name: 'Robot Factory',
      description: 'Design and build robots to complete various challenges. Creative puzzle-solving game for all ages.',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
      infoUrl: 'https://example.com/robot-factory',
      genres: ['Puzzle', 'Family'],
      minPlayers: 2,
      maxPlayers: 4,
      playTime: '30-45 min',
      ageRange: '8+',
      isAvailable: true,
    },
    {
      name: 'Time Travelers',
      description: 'Journey through different eras, solve historical puzzles, and prevent timeline disasters.',
      imageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop',
      infoUrl: 'https://example.com/time-travelers',
      genres: ['Campaign', 'Adventure'],
      minPlayers: 2,
      maxPlayers: 4,
      playTime: '45-60 min',
      ageRange: '10+',
      isAvailable: true,
    },
  ]

  for (const product of products2) {
    await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          manufacturerId: publisher2.manufacturer!.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          infoUrl: product.infoUrl,
          minPlayers: product.minPlayers,
          maxPlayers: product.maxPlayers,
          playTime: product.playTime,
          ageRange: product.ageRange,
          isAvailable: product.isAvailable,
        },
      })

      const genres = await Promise.all(
        product.genres.map((genreName) =>
          tx.genre.upsert({
            where: { name: genreName },
            update: {},
            create: { name: genreName },
          })
        )
      )

      await tx.productGenre.createMany({
        data: genres.map((genre) => ({
          productId: createdProduct.id,
          genreId: genre.id,
        })),
      })
    })
  }

  console.log('Created publisher 2 with 5 products')
  console.log('Seeding completed!')
  console.log('\nTest accounts created:')
  console.log('Publisher 1: fantasygames@example.com / password123')
  console.log('Publisher 2: scifigames@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

