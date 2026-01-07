'use client'

import { useState } from 'react'
import styles from './AccessibilitySection.module.css'

interface AccessibilityVote {
    id: string
    colorblindMode: boolean
    subtitles: boolean
    remappableKeys: boolean
    difficultyModes: boolean
    screenReader: boolean
    onHandedMode: boolean
}

interface Props {
    gameId: string
    votes: AccessibilityVote[]
    isLoggedIn: boolean
}

const FEATURES = [
    { key: 'colorblindMode', label: 'Colorblind Mode', icon: '🎨' },
    { key: 'subtitles', label: 'Subtitles', icon: '💬' },
    { key: 'remappableKeys', label: 'Remappable Controls', icon: '🎮' },
    { key: 'difficultyModes', label: 'Difficulty Options', icon: '⚙️' },
    { key: 'screenReader', label: 'Screen Reader', icon: '🔊' },
    { key: 'onHandedMode', label: 'One-Handed Mode', icon: '👋' },
] as const

export default function AccessibilitySection({ gameId, votes, isLoggedIn }: Props) {
    const [showForm, setShowForm] = useState(false)
    const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({})

    const totalVotes = votes.length

    const getPercentage = (key: string) => {
        if (totalVotes === 0) return 0
        const count = votes.filter(v => v[key as keyof AccessibilityVote]).length
        return Math.round((count / totalVotes) * 100)
    }

    const handleToggle = (key: string) => {
        setSelectedFeatures(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSubmit = async () => {
        const res = await fetch('/api/accessibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameId,
                ...selectedFeatures,
            }),
        })

        if (res.ok) {
            setShowForm(false)
            window.location.reload()
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.features}>
                {FEATURES.map(({ key, label, icon }) => {
                    const percentage = getPercentage(key)
                    return (
                        <div key={key} className={styles.feature}>
                            <div className={styles.featureInfo}>
                                <span className={styles.featureIcon}>{icon}</span>
                                <span className={styles.featureLabel}>{label}</span>
                            </div>
                            <div className={styles.featureBar}>
                                <div
                                    className={styles.featureFill}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <span className={styles.featurePercent}>
                                {percentage}%
                            </span>
                        </div>
                    )
                })}
            </div>

            {totalVotes > 0 && (
                <p className={styles.voteCount}>Based on {totalVotes} votes</p>
            )}

            {isLoggedIn && !showForm && (
                <button onClick={() => setShowForm(true)} className={styles.voteBtn}>
                    Vote on Features
                </button>
            )}

            {showForm && (
                <div className={styles.form}>
                    <p className={styles.formTitle}>Select features this game has:</p>
                    <div className={styles.checkboxes}>
                        {FEATURES.map(({ key, label, icon }) => (
                            <label key={key} className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={selectedFeatures[key] || false}
                                    onChange={() => handleToggle(key)}
                                />
                                <span className={styles.checkmark}></span>
                                <span>{icon} {label}</span>
                            </label>
                        ))}
                    </div>
                    <div className={styles.formActions}>
                        <button onClick={() => setShowForm(false)} className={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button onClick={handleSubmit} className={styles.submitBtn}>
                            Submit Vote
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
