'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './import.module.css'

interface GameResult {
    rawgId: number
    title: string
    slug: string
    description: string
    coverUrl: string | null
    genre: string | null
    releaseDate: string | null
    rating: number
    platforms: string[]
    tags: string[]
}

export default function ImportGamesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<GameResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [importing, setImporting] = useState<string | null>(null)
    const [imported, setImported] = useState<Set<string>>(new Set())

    if (status === 'unauthenticated') {
        router.push('/login')
        return null
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setError('')
        setResults([])

        try {
            const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Search failed')
                if (data.help) setError(prev => `${prev}\n${data.help}`)
                return
            }

            setResults(data.games)
        } catch (err) {
            setError('Failed to search games')
        } finally {
            setLoading(false)
        }
    }

    const handleImport = async (game: GameResult) => {
        setImporting(game.slug)

        try {
            const res = await fetch('/api/games/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: game.title,
                    slug: game.slug,
                    description: game.description,
                    coverUrl: game.coverUrl,
                    genre: game.genre,
                }),
            })

            const data = await res.json()

            if (res.status === 409) {
                setError(`"${game.title}" already exists in your database`)
            } else if (!res.ok) {
                setError(data.error || 'Import failed')
            } else {
                setImported(prev => new Set(prev).add(game.slug))
            }
        } catch (err) {
            setError('Failed to import game')
        } finally {
            setImporting(null)
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <span className={styles.titleIcon}>⬡</span>
                    Import Games
                </h1>
                <p className={styles.subtitle}>
                    Search RAWG database and add games to your collection
                </p>
            </header>

            {/* Search Form */}
            <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for a game..."
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchBtn} disabled={loading}>
                        {loading ? (
                            <span className={styles.spinner}></span>
                        ) : (
                            '🔍 Search'
                        )}
                    </button>
                </div>
            </form>

            {error && (
                <div className={styles.error}>
                    {error.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className={styles.results}>
                    <p className={styles.resultCount}>
                        Found {results.length} games
                    </p>
                    <div className={styles.grid}>
                        {results.map((game) => (
                            <div key={game.rawgId} className={styles.card}>
                                <div className={styles.cardImage}>
                                    {game.coverUrl ? (
                                        <img src={game.coverUrl} alt={game.title} />
                                    ) : (
                                        <div className={styles.placeholder}>🎮</div>
                                    )}
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>{game.title}</h3>
                                    {game.genre && (
                                        <span className={styles.genre}>{game.genre}</span>
                                    )}
                                    {game.releaseDate && (
                                        <span className={styles.year}>
                                            {new Date(game.releaseDate).getFullYear()}
                                        </span>
                                    )}
                                    <div className={styles.rating}>
                                        ⭐ {game.rating.toFixed(1)}
                                    </div>
                                    {game.platforms.length > 0 && (
                                        <div className={styles.platforms}>
                                            {game.platforms.slice(0, 3).join(' • ')}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleImport(game)}
                                    disabled={importing === game.slug || imported.has(game.slug)}
                                    className={`${styles.importBtn} ${imported.has(game.slug) ? styles.imported : ''}`}
                                >
                                    {importing === game.slug ? (
                                        <span className={styles.spinner}></span>
                                    ) : imported.has(game.slug) ? (
                                        '✓ Added'
                                    ) : (
                                        '+ Add to Database'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && !error && results.length === 0 && query && (
                <div className={styles.noResults}>
                    <p>No games found for "{query}"</p>
                </div>
            )}
        </div>
    )
}
