'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import styles from './Header.module.css'

export default function Header() {
    const { data: session, status } = useSession()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { theme, toggleTheme } = useTheme()

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoGlitch} data-text="RATE">RATE</span>
                    <span className={styles.logoPunk}>PUNK</span>
                </Link>

                <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
                    <Link href="/games" className={styles.navLink}>
                        <span className={styles.navIcon}>⬡</span>
                        Games
                    </Link>
                    <Link href="/games/import" className={styles.navLink}>
                        <span className={styles.navIcon}>🔍</span>
                        Search
                    </Link>
                    <Link href="/reviews" className={styles.navLink}>
                        <span className={styles.navIcon}>◈</span>
                        Reviews
                    </Link>
                    <Link href="/leaderboard" className={styles.navLink}>
                        <span className={styles.navIcon}>△</span>
                        Leaderboard
                    </Link>
                </nav>

                <button
                    className={styles.themeToggle}
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <div className={styles.actions}>
                    {status === 'loading' ? (
                        <div className={styles.skeleton}></div>
                    ) : session ? (
                        <div className={styles.userMenu}>
                            <Link href="/profile" className={styles.profileLink}>
                                <div className={styles.avatar}>
                                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className={styles.username}>{session.user?.name}</span>
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className={styles.logoutBtn}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <Link href="/login" className="btn btn-ghost">
                                Login
                            </Link>
                            <Link href="/register" className="btn btn-primary">
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                <button
                    className={styles.mobileToggle}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </header>
    )
}
