import Link from 'next/link'
import styles from './page.module.css'

export default function HomePage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.gridOverlay}></div>
          <div className={styles.glowOrb1}></div>
          <div className={styles.glowOrb2}></div>
          <div className={styles.glowOrb3}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot}></span>
            Community-Powered Reviews
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleLine1}>RATE THE</span>
            <span className={styles.titleLine2} data-text="FUTURE">FUTURE</span>
          </h1>

          <p className={styles.subtitle}>
            The cyberpunk video game rating platform where the community decides what&apos;s worth your time.
            Real metrics. Real gamers. Zero corporate bias.
          </p>

          <div className={styles.cta}>
            <Link href="/games" className={styles.ctaPrimary}>
              <span>Explore Games</span>
              <span className={styles.ctaArrow}>→</span>
            </Link>
            <Link href="/games/import" className={styles.ctaSecondary}>
              🔍 Search for Games
            </Link>
            <Link href="/register" className={styles.ctaSecondary}>
              Join the Network
            </Link>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>2,400+</span>
              <span className={styles.statLabel}>Games Rated</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>15K+</span>
              <span className={styles.statLabel}>Reviews</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>98%</span>
              <span className={styles.statLabel}>Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>◆</span>
          What Makes Us Different
        </h2>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💰</div>
            <h3>Greed Score</h3>
            <p>Community-rated monetization meter. Know exactly how aggressive a game&apos;s microtransactions are before you buy.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🖥️</div>
            <h3>Performance Reports</h3>
            <p>Real FPS data from real hardware. See how games run on your exact GPU/CPU combo before downloading.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⏱️</div>
            <h3>Time to Beat</h3>
            <p>Crowdsourced playtime estimates. Plan your backlog with accurate completion times from the community.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>♿</div>
            <h3>Accessibility Wiki</h3>
            <p>Community-verified accessibility features. Find games that work for everyone.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔄</div>
            <h3>Patch-Aware Reviews</h3>
            <p>Reviews tagged by game version. See if that launch-day nightmare has been fixed.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏷️</div>
            <h3>Vibe Tags</h3>
            <p>Find &quot;Cozy + Sci-Fi&quot; or &quot;Sweaty + Medieval&quot; games. Community-driven mood matching.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2>Ready to rate the future?</h2>
          <p>Join thousands of gamers sharing honest reviews and real data.</p>
          <Link href="/register" className={styles.ctaButton}>
            Create Account
            <span className={styles.ctaGlow}></span>
          </Link>
        </div>
      </section>
    </div>
  )
}
