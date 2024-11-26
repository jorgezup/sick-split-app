import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

// Configure connection pooling for production
if (process.env.NODE_ENV === 'production') {
  prisma.$connect()
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}