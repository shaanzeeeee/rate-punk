'use client'

import { useState } from 'react'
import styles from './ReviewFilters.module.css'

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'

interface FiltersState {
    minRating: number
    maxRating: number
    minGreed: number
    maxGreed: number
    sortBy: SortOption
}

interface Props {
    onFilterChange: (filters: FiltersState) => void
}

export default function ReviewFilters({ onFilterChange }: Props) {
    const [filters, setFilters] = useState<FiltersState>({
        minRating: 1,
        maxRating: 10,
        minGreed: 1,
        maxGreed: 10,
        sortBy: 'newest'
    })
    const [isExpanded, setIsExpanded] = useState(false)

    const handleChange = (key: keyof FiltersState, value: number | string) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const resetFilters = () => {
        const defaultFilters: FiltersState = {
            minRating: 1,
            maxRating: 10,
            minGreed: 1,
            maxGreed: 10,
            sortBy: 'newest'
        }
        setFilters(defaultFilters)
        onFilterChange(defaultFilters)
    }

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterHeader}>
                <button
                    className={styles.toggleBtn}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    🔧 {isExpanded ? 'Hide Filters' : 'Show Filters'}
                </button>

                <div className={styles.sortControl}>
                    <label className={styles.sortLabel}>Sort:</label>
                    <select
                        className={styles.sortSelect}
                        value={filters.sortBy}
                        onChange={(e) => handleChange('sortBy', e.target.value)}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                        <option value="helpful">Most Helpful</option>
                    </select>
                </div>
            </div>

            {isExpanded && (
                <div className={styles.filterPanel}>
                    <div className={styles.filterRow}>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Rating Range</label>
                            <div className={styles.rangeInputs}>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={filters.minRating}
                                    onChange={(e) => handleChange('minRating', parseInt(e.target.value) || 1)}
                                    className={styles.rangeInput}
                                />
                                <span className={styles.rangeSeparator}>to</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={filters.maxRating}
                                    onChange={(e) => handleChange('maxRating', parseInt(e.target.value) || 10)}
                                    className={styles.rangeInput}
                                />
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Greed Score Range</label>
                            <div className={styles.rangeInputs}>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={filters.minGreed}
                                    onChange={(e) => handleChange('minGreed', parseInt(e.target.value) || 1)}
                                    className={styles.rangeInput}
                                />
                                <span className={styles.rangeSeparator}>to</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={filters.maxGreed}
                                    onChange={(e) => handleChange('maxGreed', parseInt(e.target.value) || 10)}
                                    className={styles.rangeInput}
                                />
                            </div>
                        </div>
                    </div>

                    <button className={styles.resetBtn} onClick={resetFilters}>
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
    )
}

export type { FiltersState }
