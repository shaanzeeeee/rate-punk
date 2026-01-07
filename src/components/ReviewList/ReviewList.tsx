import styles from './ReviewList.module.css'

interface Review {
    id: string
    content: string
    rating: number
    greedScore: number | null
    playtimeHours: number | null
    gameVersion: string | null
    isOutdated: boolean
    isVerifiedOwner: boolean
    createdAt: Date
    user: {
        id: string
        username: string
    }
}

interface Props {
    reviews: Review[]
    currentVersion?: string | null
}

export default function ReviewList({ reviews, currentVersion }: Props) {
    if (reviews.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No reviews yet. Be the first to share your thoughts!</p>
            </div>
        )
    }

    return (
        <div className={styles.list}>
            {reviews.map((review) => {
                const isOutdated = currentVersion && review.gameVersion &&
                    review.gameVersion !== currentVersion

                return (
                    <article
                        key={review.id}
                        className={`${styles.review} ${isOutdated ? styles.outdated : ''}`}
                    >
                        <div className={styles.header}>
                            <div className={styles.user}>
                                <div className={styles.avatar}>
                                    {review.user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className={styles.username}>{review.user.username}</span>
                                    {review.isVerifiedOwner && (
                                        <span className={styles.badge}>✓ Verified Owner</span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.meta}>
                                <div className={styles.rating}>
                                    <span className={styles.ratingValue}>{review.rating}/10</span>
                                    <div className={styles.stars}>
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`${styles.star} ${i < Math.round(review.rating / 2) ? styles.filled : ''}`}
                                            >★</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isOutdated && (
                            <div className={styles.outdatedBadge}>
                                ⚠️ Reviewed on v{review.gameVersion} (current: v{currentVersion})
                            </div>
                        )}

                        <p className={styles.content}>{review.content}</p>

                        <div className={styles.footer}>
                            {review.greedScore !== null && (
                                <span className={`${styles.metric} ${getGreedClass(review.greedScore, styles)}`}>
                                    💰 Greed: {review.greedScore}/10
                                </span>
                            )}
                            {review.playtimeHours !== null && (
                                <span className={styles.metric}>
                                    ⏱️ Playtime: {review.playtimeHours}h
                                </span>
                            )}
                            <span className={styles.date}>
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </article>
                )
            })}
        </div>
    )
}

function getGreedClass(score: number, styles: Record<string, string>): string {
    if (score <= 3) return styles.greedLow
    if (score <= 6) return styles.greedMedium
    return styles.greedHigh
}
