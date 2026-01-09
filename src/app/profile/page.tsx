'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './profile.module.css'

interface Review {
    id: string
    content: string
    rating: number
    greedScore: number | null
    playtimeHours: number | null
    createdAt: string
    game: {
        id: string
        title: string
        slug: string
        coverUrl: string | null
        genre: string | null
    }
}


interface Badge {
    id: string
    type: string
    meta: string | null
    awardedAt: string
}

interface ProfileData {
    user: {
        id: string
        username: string
        email: string | null
        createdAt: string
        badges: Badge[]
        _count: {
            reviews: number
        }
    }
    reviews: Review[]
    stats: {
        totalReviews: number
        avgRating: number
        totalUpvotes: number
    }
    totalPages: number
    currentPage: number
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest'

function ProfileContent() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [data, setData] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState<SortOption>(
        (searchParams.get('sort') as SortOption) || 'newest'
    )
    const currentPage = parseInt(searchParams.get('page') || '1')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
            return
        }

        if (status === 'authenticated') {
            fetchProfile()
        }
    }, [status, currentPage, sortBy])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/profile?page=${currentPage}&sort=${sortBy}`)
            if (res.ok) {
                const profileData = await res.json()
                setData(profileData)
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSortChange = (newSort: SortOption) => {
        setSortBy(newSort)
        router.push(`/profile?page=1&sort=${newSort}`)
    }

    const handlePageChange = (page: number) => {
        router.push(`/profile?page=${page}&sort=${sortBy}`)
    }

    if (status === 'loading' || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Failed to load profile</div>
            </div>
        )
    }

    const memberSince = new Date(data.user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className={styles.container}>
            {/* Profile Header */}
            <section className={styles.header}>
                <div className={styles.avatar}>
                    {data.user.username.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userInfo}>
                    <h1 className={styles.username}>{data.user.username}</h1>
                    <p className={styles.email}>{data.user.email}</p>

                    {/* Badges */}
                    {data.user.badges.length > 0 && (
                        <div className={styles.badges}>
                            {data.user.badges.map(badge => (
                                <span key={badge.id} className={styles.badge} data-type={badge.type}>
                                    {getBadgeEmoji(badge.type)} {getBadgeLabel(badge.type)}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{data.stats.totalReviews}</span>
                            <span className={styles.statLabel}>Reviews</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{data.stats.avgRating.toFixed(1)}</span>
                            <span className={styles.statLabel}>Avg Rating</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{data.stats.totalUpvotes}</span>
                            <span className={styles.statLabel}>Upvotes</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{memberSince}</span>
                            <span className={styles.statLabel}>Member Since</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className={styles.reviewsSection}>
                <div className={styles.reviewsHeader}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>📝</span>
                        My Reviews
                    </h2>

                    <div className={styles.sortControls}>
                        <span className={styles.sortLabel}>Sort by:</span>
                        <div className={styles.sortButtons}>
                            {[
                                { value: 'newest', label: 'Newest' },
                                { value: 'oldest', label: 'Oldest' },
                                { value: 'highest', label: 'Highest Rated' },
                                { value: 'lowest', label: 'Lowest Rated' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSortChange(option.value as SortOption)}
                                    className={`${styles.sortBtn} ${sortBy === option.value ? styles.active : ''}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {data.reviews.length === 0 ? (
                    <div className={styles.empty}>
                        <p>You haven&apos;t reviewed any games yet.</p>
                        <Link href="/games" className={styles.browseBtn}>
                            Browse Games
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className={styles.reviewsList}>
                            {data.reviews.map((review) => (
                                <Link
                                    key={review.id}
                                    href={`/games/${review.game.slug}`}
                                    className={styles.reviewCard}
                                >
                                    <div className={styles.gameImage}>
                                        {review.game.coverUrl ? (
                                            <img src={review.game.coverUrl} alt={review.game.title} />
                                        ) : (
                                            <div className={styles.placeholder}>🎮</div>
                                        )}
                                    </div>

                                    <div className={styles.reviewContent}>
                                        <div className={styles.gameInfo}>
                                            <h3 className={styles.gameTitle}>{review.game.title}</h3>
                                            {review.game.genre && (
                                                <span className={styles.genre}>{review.game.genre}</span>
                                            )}
                                        </div>

                                        <p className={styles.reviewText}>
                                            {review.content.length > 150
                                                ? `${review.content.substring(0, 150)}...`
                                                : review.content}
                                        </p>

                                        <div className={styles.reviewMeta}>
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

                                            {review.greedScore !== null && (
                                                <span className={styles.greed}>
                                                    💰 {review.greedScore}/10
                                                </span>
                                            )}

                                            {review.playtimeHours !== null && (
                                                <span className={styles.playtime}>
                                                    ⏱️ {review.playtimeHours}h
                                                </span>
                                            )}

                                            <span className={styles.date}>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {data.totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className={styles.pageBtn}
                                >
                                    ← Previous
                                </button>

                                <div className={styles.pageNumbers}>
                                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`${styles.pageNum} ${currentPage === page ? styles.activePage : ''}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= data.totalPages}
                                    className={styles.pageBtn}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    )
}

function ProfileLoading() {
    return (
        <div className={styles.container}>
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading profile...</p>
            </div>
        </div>
    )
}

function getBadgeEmoji(type: string): string {
    const badges: Record<string, string> = {
        'hidden_gem_hunter': '💎',
        'verified_owner': '✓',
        'taste_buddy': '🤝',
        'prolific_reviewer': '📝',
    }
    return badges[type] || '🏆'
}

function getBadgeLabel(type: string): string {
    const labels: Record<string, string> = {
        'hidden_gem_hunter': 'Hidden Gem Hunter',
        'verified_owner': 'Verified Owner',
        'taste_buddy': 'Taste Buddy',
        'prolific_reviewer': 'Prolific Reviewer',
    }
    return labels[type] || type
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<ProfileLoading />}>
            <ProfileContent />
        </Suspense>
    )
}
