import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import ReviewForm from '@/components/ReviewForm'
import ReviewList from '@/components/ReviewList'
import PerformanceSection from '@/components/PerformanceSection'
import AccessibilitySection from '@/components/AccessibilitySection'
import styles from './game.module.css'

interface Props {
    params: Promise<{ slug: string }>
}

async function getGame(slug: string) {
    const game = await prisma.game.findUnique({
        where: { slug },
        include: {
            reviews: {
                include: { user: { select: { id: true, username: true } } },
                orderBy: { createdAt: 'desc' },
            },
            gameTags: { orderBy: { count: 'desc' } },
            performanceData: true,
            accessibilityVotes: true,
        },
    })
    return game
}

export default async function GamePage({ params }: Props) {
    const { slug } = await params
    const game = await getGame(slug)
    const session = await auth()

    if (!game) {
        notFound()
    }

    const avgRating = game.reviews.length > 0
        ? game.reviews.reduce((acc, r) => acc + r.rating, 0) / game.reviews.length
        : 0

    const reviewsWithGreed = game.reviews.filter(r => r.greedScore !== null)
    const avgGreedScore = reviewsWithGreed.length > 0
        ? reviewsWithGreed.reduce((acc, r) => acc + (r.greedScore || 0), 0) / reviewsWithGreed.length
        : null

    const reviewsWithPlaytime = game.reviews.filter(r => r.playtimeHours !== null)
    const avgPlaytime = reviewsWithPlaytime.length > 0
        ? reviewsWithPlaytime.reduce((acc, r) => acc + (r.playtimeHours || 0), 0) / reviewsWithPlaytime.length
        : null

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroBackground}>
                    {game.coverUrl && (
                        <img src={game.coverUrl} alt="" className={styles.heroImage} />
                    )}
                    <div className={styles.heroOverlay}></div>
                </div>

                <div className={styles.heroContent}>
                    <div className={styles.coverWrapper}>
                        {game.coverUrl ? (
                            <img src={game.coverUrl} alt={game.title} className={styles.cover} />
                        ) : (
                            <div className={styles.coverPlaceholder}>🎮</div>
                        )}
                    </div>

                    <div className={styles.info}>
                        <h1 className={styles.title}>{game.title}</h1>

                        {game.genre && (
                            <span className={styles.genre}>{game.genre}</span>
                        )}

                        {game.currentVersion && (
                            <span className={styles.version}>v{game.currentVersion}</span>
                        )}

                        {game.description && (
                            <p className={styles.description}>{game.description}</p>
                        )}

                        {/* Quick Stats */}
                        <div className={styles.quickStats}>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{avgRating.toFixed(1)}</span>
                                <span className={styles.statLabel}>Rating</span>
                                <div className={styles.stars}>
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`${styles.star} ${i < Math.round(avgRating / 2) ? styles.filled : ''}`}
                                        >★</span>
                                    ))}
                                </div>
                            </div>

                            {avgGreedScore !== null && (
                                <div className={styles.statCard}>
                                    <span className={styles.statValue}>{avgGreedScore.toFixed(1)}</span>
                                    <span className={styles.statLabel}>Greed Score</span>
                                    <div className={styles.greedMeter}>
                                        <div
                                            className={`${styles.greedFill} ${getGreedClass(avgGreedScore, styles)}`}
                                            style={{ width: `${avgGreedScore * 10}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {avgPlaytime !== null && (
                                <div className={styles.statCard}>
                                    <span className={styles.statValue}>{avgPlaytime.toFixed(0)}h</span>
                                    <span className={styles.statLabel}>Time to Beat</span>
                                </div>
                            )}

                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{game.reviews.length}</span>
                                <span className={styles.statLabel}>Reviews</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {game.gameTags.length > 0 && (
                            <div className={styles.tags}>
                                {game.gameTags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className={styles.tag}
                                        style={{ fontSize: getTagSize(tag.count) }}
                                    >
                                        {tag.tag}
                                        <span className={styles.tagCount}>{tag.count}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            <div className={styles.content}>
                <div className={styles.mainColumn}>
                    {/* Review Form */}
                    {session && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>✍️</span>
                                Write a Review
                            </h2>
                            <ReviewForm gameId={game.id} gameVersion={game.currentVersion} />
                        </section>
                    )}

                    {/* Reviews */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>💬</span>
                            Community Reviews
                        </h2>
                        <ReviewList reviews={game.reviews} currentVersion={game.currentVersion} />
                    </section>
                </div>

                <div className={styles.sideColumn}>
                    {/* Performance Reports */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>🖥️</span>
                            Performance
                        </h2>
                        <PerformanceSection
                            gameId={game.id}
                            reports={game.performanceData}
                            isLoggedIn={!!session}
                        />
                    </section>

                    {/* Accessibility */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>♿</span>
                            Accessibility
                        </h2>
                        <AccessibilitySection
                            gameId={game.id}
                            votes={game.accessibilityVotes}
                            isLoggedIn={!!session}
                        />
                    </section>
                </div>
            </div>
        </div>
    )
}

function getGreedClass(score: number, styles: Record<string, string>): string {
    if (score <= 3) return styles.greedLow
    if (score <= 6) return styles.greedMedium
    return styles.greedHigh
}

function getTagSize(count: number): string {
    if (count >= 20) return '1.25rem'
    if (count >= 10) return '1.1rem'
    if (count >= 5) return '1rem'
    return '0.875rem'
}
