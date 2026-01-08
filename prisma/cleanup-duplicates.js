// Script to clean up duplicate reviews (keeping the earliest one per user/game)
const { PrismaClient } = require('@prisma/client')

async function cleanupDuplicates() {
    const prisma = new PrismaClient()

    try {
        // Find all duplicate combinations
        const duplicates = await prisma.$queryRaw`
            SELECT "userId", "gameId", COUNT(*) as count
            FROM "Review"
            GROUP BY "userId", "gameId"
            HAVING COUNT(*) > 1
        `

        console.log(`Found ${duplicates.length} user/game combinations with duplicates`)

        for (const dup of duplicates) {
            // Get all reviews for this combination, ordered by createdAt
            const reviews = await prisma.review.findMany({
                where: {
                    userId: dup.userId,
                    gameId: dup.gameId,
                },
                orderBy: { createdAt: 'asc' },
            })

            // Keep the first one, delete the rest
            const toDelete = reviews.slice(1).map(r => r.id)

            if (toDelete.length > 0) {
                await prisma.review.deleteMany({
                    where: { id: { in: toDelete } }
                })
                console.log(`Deleted ${toDelete.length} duplicate reviews for user ${dup.userId} on game ${dup.gameId}`)
            }
        }

        console.log('Cleanup complete!')
    } finally {
        await prisma.$disconnect()
    }
}

cleanupDuplicates()
