import Link from 'next/link'
import prisma from '@/lib/prisma'
import styles from './leaderboard.module.css'

async function getLeaderboard() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            createdAt: true,
            _count: {
                select: { reviews: true }
            },
            reviews: {
                select: {
                    rating: true,
                }
            }
        },
        orderBy: {
            reviews: {
                _count: 'desc'
            }
        },
        take: 50,
    })

    return users.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        username: user.username,
        reviewCount: user._count.reviews,
        avgRating: user.reviews.length > 0
            ? user.reviews.reduce((acc, r) => acc + r.rating, 0) / user.reviews.length
            : 0,
        joinedAt: user.createdAt,
    }))
}

export default async function LeaderboardPage() {
    const leaderboard = await getLeaderboard()

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <span className={styles.titleIcon}>△</span>
                    Top Reviewers
                </h1>
                <p className={styles.subtitle}>
                    The most prolific game critics in the network
                </p>
            </header>

            {leaderboard.length === 0 ? (
                <div className={styles.empty}>
                    <p>No reviewers yet. Be the first to write a review!</p>
                    <Link href="/games" className={styles.browseBtn}>
                        Browse Games
                    </Link>
                </div>
            ) : (
                <div className={styles.leaderboard}>
                    {/* Top 3 Podium */}
                    <div className={styles.podium}>
                        {leaderboard.slice(0, 3).map((user, index) => (
                            <div
                                key={user.id}
                                className={`${styles.podiumCard} ${styles[`rank${index + 1}`]}`}
                            >
                                <div className={styles.rankBadge}>
                                    {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                                </div>
                                <div className={styles.podiumAvatar}>
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <h3 className={styles.podiumName}>{user.username}</h3>
                                <div className={styles.podiumStats}>
                                    <span className={styles.reviewCount}>{user.reviewCount}</span>
                                    <span className={styles.reviewLabel}>reviews</span>
                                </div>
                                <div className={styles.avgRating}>
                                    Avg: {user.avgRating.toFixed(1)}/10
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Rest of the Leaderboard */}
                    {leaderboard.length > 3 && (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.rankCol}>Rank</th>
                                        <th className={styles.userCol}>User</th>
                                        <th className={styles.reviewsCol}>Reviews</th>
                                        <th className={styles.avgCol}>Avg Rating</th>
                                        <th className={styles.joinedCol}>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.slice(3).map((user) => (
                                        <tr key={user.id} className={styles.row}>
                                            <td className={styles.rankCell}>
                                                <span className={styles.rankNumber}>#{user.rank}</span>
                                            </td>
                                            <td className={styles.userCell}>
                                                <div className={styles.userInfo}>
                                                    <div className={styles.avatar}>
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className={styles.username}>{user.username}</span>
                                                </div>
                                            </td>
                                            <td className={styles.reviewsCell}>
                                                <span className={styles.count}>{user.reviewCount}</span>
                                            </td>
                                            <td className={styles.avgCell}>
                                                <span className={styles.rating}>{user.avgRating.toFixed(1)}</span>
                                                <span className={styles.ratingMax}>/10</span>
                                            </td>
                                            <td className={styles.joinedCell}>
                                                {new Date(user.joinedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
