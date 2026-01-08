'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ReviewForm.module.css'

interface ExistingReview {
    id: string
    content: string
    rating: number
    greedScore: number | null
    playtimeHours: number | null
}

interface Props {
    gameId: string
    gameVersion?: string | null
    existingReview?: ExistingReview | null
}

export default function ReviewForm({ gameId, gameVersion, existingReview }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        content: existingReview?.content || '',
        rating: existingReview?.rating || 7,
        greedScore: existingReview?.greedScore || 5,
        playtimeHours: existingReview?.playtimeHours?.toString() || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    gameVersion,
                    content: formData.content,
                    rating: formData.rating,
                    greedScore: formData.greedScore,
                    playtimeHours: formData.playtimeHours ? parseFloat(formData.playtimeHours) : null,
                }),
            })

            if (res.ok) {
                setFormData({ content: '', rating: 7, greedScore: 5, playtimeHours: '' })
                router.refresh()
            }
        } catch (error) {
            console.error('Failed to submit review:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* Rating Slider */}
            <div className={styles.sliderGroup}>
                <label className={styles.label}>
                    Your Rating
                    <span className={styles.ratingValue}>{formData.rating}/10</span>
                </label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    className={styles.slider}
                />
                <div className={styles.sliderLabels}>
                    <span>Bad</span>
                    <span>Average</span>
                    <span>Amazing</span>
                </div>
            </div>

            {/* Greed Score Slider */}
            <div className={styles.sliderGroup}>
                <label className={styles.label}>
                    Monetization Aggressiveness
                    <span className={styles.greedValue} data-level={getGreedLevel(formData.greedScore)}>
                        {formData.greedScore}/10
                    </span>
                </label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.greedScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, greedScore: parseInt(e.target.value) }))}
                    className={`${styles.slider} ${styles.greedSlider}`}
                />
                <div className={styles.sliderLabels}>
                    <span>None</span>
                    <span>Cosmetic Only</span>
                    <span>Pay-to-Win</span>
                </div>
            </div>

            {/* Playtime */}
            <div className={styles.inputGroup}>
                <label htmlFor="playtime" className={styles.label}>
                    Time to Beat (hours)
                </label>
                <input
                    id="playtime"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g., 40"
                    value={formData.playtimeHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, playtimeHours: e.target.value }))}
                    className={styles.input}
                />
            </div>

            {/* Review Content */}
            <div className={styles.inputGroup}>
                <label htmlFor="content" className={styles.label}>
                    Your Review
                </label>
                <textarea
                    id="content"
                    rows={5}
                    placeholder="Share your experience with this game..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className={styles.textarea}
                    required
                />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                    <span className={styles.loader}></span>
                ) : (
                    <>{existingReview ? 'Update Review' : 'Submit Review'}</>
                )}
            </button>
        </form>
    )
}

function getGreedLevel(score: number): string {
    if (score <= 3) return 'low'
    if (score <= 6) return 'medium'
    return 'high'
}
