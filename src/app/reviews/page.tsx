import Link from 'next/link'
import prisma from '@/lib/prisma'
import styles from './reviews.module.css'

async function getReviews() {
    const reviews = await prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { id: true, username: true }
            },
            game: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    coverUrl: true,
                    genre: true
                }
            }
        }
    })
    return reviews
}

export default async function ReviewsPage() {
    const reviews = await getReviews()

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <span className={styles.titleIcon}>◈</span>
                    Live Feed
                </h1>
                <p className={styles.subtitle}>
                    Real-time reviews from the community • {reviews.length} total
                </p>
            </header>

            {reviews.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📝</div>
                    <p>No reviews yet. Be the first to share your thoughts!</p>
                    <Link href="/games" className={styles.browseBtn}>
                        Browse Games
                    </Link>
                </div>
            ) : (
                <div className={styles.feed}>
                    {reviews.map((review, index) => (
                        <article
                            key={review.id}
                            className={styles.card}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {/* Glowing accent */}
                            <div className={styles.cardGlow}></div>

                            {/* Game Cover Section */}
                            <Link href={`/games/${review.game.slug}`} className={styles.gameSection}>
                                <div className={styles.coverWrapper}>
                                    {review.game.coverUrl ? (
                                        <img
                                            src={review.game.coverUrl}
                                            alt={review.game.title}
                                            className={styles.cover}
                                        />
                                    ) : (
                                        <div className={styles.coverPlaceholder}>🎮</div>
                                    )}
                                </div>
                                <div className={styles.gameInfo}>
                                    <h2 className={styles.gameTitle}>{review.game.title}</h2>
                                    {review.game.genre && (
                                        <span className={styles.genre}>{review.game.genre}</span>
                                    )}
                                </div>
                            </Link>

                            {/* Rating Section */}
                            <div className={styles.ratingSection}>
                                <div className={styles.ratingCircle} data-rating={getRatingLevel(review.rating)}>
                                    <span className={styles.ratingNumber}>{review.rating}</span>
                                    <span className={styles.ratingMax}>/10</span>
                                </div>
                                <div className={styles.stars}>
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`${styles.star} ${i < Math.round(review.rating / 2) ? styles.filled : ''}`}
                                        >★</span>
                                    ))}
                                </div>
                            </div>

                            {/* Review Content */}
                            <div className={styles.reviewContent}>
                                <p className={styles.reviewText}>{review.content}</p>
                            </div>

                            {/* Metrics Bar */}
                            {(review.greedScore !== null || review.playtimeHours !== null) && (
                                <div className={styles.metricsBar}>
                                    {review.greedScore !== null && (
                                        <div className={`${styles.metric} ${styles[getGreedClass(review.greedScore)]}`}>
                                            <span className={styles.metricIcon}>💰</span>
                                            <span className={styles.metricLabel}>Greed</span>
                                            <span className={styles.metricValue}>{review.greedScore}/10</span>
                                        </div>
                                    )}
                                    {review.playtimeHours !== null && (
                                        <div className={styles.metric}>
                                            <span className={styles.metricIcon}>⏱️</span>
                                            <span className={styles.metricLabel}>Playtime</span>
                                            <span className={styles.metricValue}>{review.playtimeHours}h</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            <div className={styles.cardFooter}>
                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>
                                        {review.user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={styles.username}>{review.user.username}</span>
                                    {review.isVerifiedOwner && (
                                        <span className={styles.verifiedBadge}>✓ Verified</span>
                                    )}
                                </div>
                                <div className={styles.timestamp}>
                                    {getTimeAgo(new Date(review.createdAt))}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}

function getRatingLevel(rating: number): string {
    if (rating >= 8) return 'high'
    if (rating >= 5) return 'medium'
    return 'low'
}

function getGreedClass(score: number): string {
    if (score <= 3) return 'greedLow'
    if (score <= 6) return 'greedMedium'
    return 'greedHigh'
}

function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
}
