'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
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
    upvotes: number
    createdAt: Date
    user: {
        id: string
        username: string
    }
}

interface Props {
    reviews: Review[]
    currentVersion?: string | null
    filterMinRating?: number
    filterMaxRating?: number
    filterMinGreed?: number
    filterMaxGreed?: number
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
}

export default function ReviewList({
    reviews: initialReviews,
    currentVersion,
    filterMinRating = 1,
    filterMaxRating = 10,
    filterMinGreed = 1,
    filterMaxGreed = 10,
    sortBy = 'newest'
}: Props) {
    const { data: session } = useSession()
    const [reviews, setReviews] = useState(initialReviews)
    const [userVotes, setUserVotes] = useState<Record<string, number>>({})
    const [voting, setVoting] = useState<string | null>(null)

    // Apply filters and sorting
    const filteredReviews = reviews
        .filter(r => r.rating >= filterMinRating && r.rating <= filterMaxRating)
        .filter(r => {
            if (r.greedScore === null) return true
            return r.greedScore >= filterMinGreed && r.greedScore <= filterMaxGreed
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                case 'highest':
                    return b.rating - a.rating
                case 'lowest':
                    return a.rating - b.rating
                case 'helpful':
                    return b.upvotes - a.upvotes
                default: // newest
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
        })

    const handleVote = async (reviewId: string, value: number) => {
        if (!session) return
        if (voting) return

        // Find the review
        const review = reviews.find(r => r.id === reviewId)
        if (!review) return

        // Can't vote on your own review
        if (review.user.id === session.user?.id) return

        setVoting(reviewId)

        try {
            // If clicking same vote, remove it
            const currentVote = userVotes[reviewId] || 0
            const newValue = currentVote === value ? 0 : value

            const res = await fetch(`/api/reviews/${reviewId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: newValue })
            })

            if (res.ok) {
                // Update local state
                setUserVotes(prev => ({
                    ...prev,
                    [reviewId]: newValue
                }))

                // Update upvotes count
                setReviews(prev => prev.map(r => {
                    if (r.id === reviewId) {
                        const oldVote = currentVote
                        const diff = newValue - oldVote
                        return { ...r, upvotes: r.upvotes + diff }
                    }
                    return r
                }))
            }
        } catch (error) {
            console.error('Vote failed:', error)
        } finally {
            setVoting(null)
        }
    }

    if (filteredReviews.length === 0) {
        return (
            <div className={styles.empty}>
                <p>{reviews.length === 0 ? 'No reviews yet. Be the first to share your thoughts!' : 'No reviews match your filters.'}</p>
            </div>
        )
    }

    return (
        <div className={styles.list}>
            {filteredReviews.map((review) => {
                const isOutdated = currentVersion && review.gameVersion &&
                    review.gameVersion !== currentVersion
                const userVote = userVotes[review.id] || 0
                const isOwnReview = session?.user?.id === review.user.id

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
                            {/* Vote Buttons */}
                            <div className={styles.voteSection}>
                                <button
                                    className={`${styles.voteBtn} ${userVote === 1 ? styles.upvoted : ''}`}
                                    onClick={() => handleVote(review.id, 1)}
                                    disabled={!session || isOwnReview || voting === review.id}
                                    title={isOwnReview ? "Can't vote on your own review" : "Helpful"}
                                >
                                    ▲
                                </button>
                                <span className={`${styles.voteCount} ${review.upvotes > 0 ? styles.positive : review.upvotes < 0 ? styles.negative : ''}`}>
                                    {review.upvotes}
                                </span>
                                <button
                                    className={`${styles.voteBtn} ${userVote === -1 ? styles.downvoted : ''}`}
                                    onClick={() => handleVote(review.id, -1)}
                                    disabled={!session || isOwnReview || voting === review.id}
                                    title={isOwnReview ? "Can't vote on your own review" : "Not helpful"}
                                >
                                    ▼
                                </button>
                            </div>

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
