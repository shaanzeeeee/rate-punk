import Link from 'next/link'
import prisma from '@/lib/prisma'
import styles from './games.module.css'

async function getGames() {
    const games = await prisma.game.findMany({
        include: {
            reviews: {
                select: {
                    rating: true,
                    greedScore: true,
                }
            },
            gameTags: {
                orderBy: { count: 'desc' },
                take: 3,
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return games.map(game => ({
        ...game,
        avgRating: game.reviews.length > 0
            ? game.reviews.reduce((acc, r) => acc + r.rating, 0) / game.reviews.length
            : 0,
        avgGreedScore: game.reviews.filter(r => r.greedScore).length > 0
            ? game.reviews.filter(r => r.greedScore).reduce((acc, r) => acc + (r.greedScore || 0), 0) / game.reviews.filter(r => r.greedScore).length
            : null,
        reviewCount: game.reviews.length,
    }))
}

export default async function GamesPage() {
    const games = await getGames()

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <span className={styles.titleIcon}>⬡</span>
                    Game Database
                </h1>
                <p className={styles.subtitle}>
                    {games.length} games rated by the community
                </p>
            </header>

            {games.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>🎮</div>
                    <h2>No games yet</h2>
                    <p>Be the first to add a game to the database!</p>
                    <Link href="/games/add" className={styles.addButton}>
                        Add Game
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {games.map((game, index) => (
                        <Link
                            key={game.id}
                            href={`/games/${game.slug}`}
                            className={styles.card}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={styles.cardImage}>
                                {game.coverUrl ? (
                                    <img src={game.coverUrl} alt={game.title} />
                                ) : (
                                    <div className={styles.placeholderImage}>
                                        <span>🎮</span>
                                    </div>
                                )}
                                {game.avgGreedScore !== null && (
                                    <div className={`${styles.greedBadge} ${getGreedClass(game.avgGreedScore)}`}>
                                        💰 {game.avgGreedScore.toFixed(1)}
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{game.title}</h3>

                                {game.genre && (
                                    <span className={styles.genre}>{game.genre}</span>
                                )}

                                <div className={styles.rating}>
                                    <div className={styles.stars}>
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`${styles.star} ${i < Math.round(game.avgRating / 2) ? styles.filled : ''}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <span className={styles.ratingValue}>
                                        {game.avgRating.toFixed(1)}/10
                                    </span>
                                    <span className={styles.reviewCount}>
                                        ({game.reviewCount})
                                    </span>
                                </div>

                                {game.gameTags.length > 0 && (
                                    <div className={styles.tags}>
                                        {game.gameTags.map(tag => (
                                            <span key={tag.id} className={styles.tag}>
                                                {tag.tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardGlow}></div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

function getGreedClass(score: number): string {
    if (score <= 3) return styles.greedLow
    if (score <= 6) return styles.greedMedium
    return styles.greedHigh
}
