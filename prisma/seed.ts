import prisma from '../src/lib/prisma'

const sampleGames = [
    {
        title: 'Cyberpunk 2077',
        slug: 'cyberpunk-2077',
        description: 'An open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival.',
        genre: 'RPG',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4hk8.webp',
        currentVersion: '2.1',
    },
    {
        title: 'Elden Ring',
        slug: 'elden-ring',
        description: 'A fantasy action-RPG adventure set within a world created by Hidetaka Miyazaki and George R. R. Martin.',
        genre: 'Action RPG',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
        currentVersion: '1.12',
    },
    {
        title: 'Baldur\'s Gate 3',
        slug: 'baldurs-gate-3',
        description: 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal.',
        genre: 'RPG',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
        currentVersion: '1.0',
    },
    {
        title: 'Hollow Knight',
        slug: 'hollow-knight',
        description: 'A challenging 2D action-adventure platformer. Explore twisting caverns, battle tainted creatures.',
        genre: 'Metroidvania',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp',
        currentVersion: '1.5',
    },
    {
        title: 'Hades',
        slug: 'hades',
        description: 'Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler.',
        genre: 'Roguelike',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r0o.webp',
        currentVersion: '1.38',
    },
    {
        title: 'Stardew Valley',
        slug: 'stardew-valley',
        description: 'Turn your overgrown field into a lively farm! Raise animals, grow crops, and make friends.',
        genre: 'Simulation',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/xrpmydnu9rpxvxfjkiu7.webp',
        currentVersion: '1.6',
    },
]

const sampleTags = [
    { gameSlug: 'cyberpunk-2077', tags: ['Open World', 'Story Rich', 'Atmospheric'] },
    { gameSlug: 'elden-ring', tags: ['Souls-like', 'Challenging', 'Open World'] },
    { gameSlug: 'baldurs-gate-3', tags: ['Story Rich', 'Turn-Based', 'Co-op'] },
    { gameSlug: 'hollow-knight', tags: ['Challenging', 'Atmospheric', 'Exploration'] },
    { gameSlug: 'hades', tags: ['Fast-Paced', 'Story Rich', 'Replayable'] },
    { gameSlug: 'stardew-valley', tags: ['Relaxing', 'Cozy', 'Farming'] },
]

async function main() {
    console.log('🌱 Seeding database...')

    // Create games
    for (const game of sampleGames) {
        const created = await prisma.game.upsert({
            where: { slug: game.slug },
            update: game,
            create: game,
        })
        console.log(`  ✅ Created game: ${created.title}`)
    }

    // Create tags
    for (const { gameSlug, tags } of sampleTags) {
        const game = await prisma.game.findUnique({ where: { slug: gameSlug } })
        if (game) {
            for (const tag of tags) {
                await prisma.gameTag.upsert({
                    where: { gameId_tag: { gameId: game.id, tag } },
                    update: { count: { increment: 1 } },
                    create: { gameId: game.id, tag, count: 1 },
                })
            }
            console.log(`  🏷️  Added tags to: ${gameSlug}`)
        }
    }

    console.log('✨ Seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
