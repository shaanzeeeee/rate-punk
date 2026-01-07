'use client'

import { useState } from 'react'
import styles from './PerformanceSection.module.css'

interface PerformanceReport {
    id: string
    gpu: string
    cpu: string
    resolution: string
    avgFps: number
    settings: string
}

interface Props {
    gameId: string
    reports: PerformanceReport[]
    isLoggedIn: boolean
}

const GPU_OPTIONS = [
    'RTX 4090', 'RTX 4080', 'RTX 4070 Ti', 'RTX 4070', 'RTX 4060 Ti', 'RTX 4060',
    'RTX 3090', 'RTX 3080', 'RTX 3070', 'RTX 3060', 'RTX 3050',
    'RX 7900 XTX', 'RX 7900 XT', 'RX 7800 XT', 'RX 7700 XT', 'RX 7600',
    'RX 6900 XT', 'RX 6800 XT', 'RX 6700 XT', 'RX 6600 XT',
    'GTX 1660 Super', 'GTX 1650', 'Other'
]

const RESOLUTION_OPTIONS = ['720p', '1080p', '1440p', '4K']
const SETTINGS_OPTIONS = ['Low', 'Medium', 'High', 'Ultra']

export default function PerformanceSection({ gameId, reports, isLoggedIn }: Props) {
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        gpu: '',
        cpu: '',
        resolution: '1080p',
        avgFps: '',
        settings: 'High',
    })

    // Group reports by GPU for visualization
    const gpuGroups = reports.reduce((acc, report) => {
        if (!acc[report.gpu]) {
            acc[report.gpu] = []
        }
        acc[report.gpu].push(report)
        return acc
    }, {} as Record<string, PerformanceReport[]>)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch('/api/performance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameId,
                ...formData,
                avgFps: parseInt(formData.avgFps),
            }),
        })

        if (res.ok) {
            setShowForm(false)
            setFormData({ gpu: '', cpu: '', resolution: '1080p', avgFps: '', settings: 'High' })
            window.location.reload()
        }
    }

    return (
        <div className={styles.container}>
            {reports.length === 0 ? (
                <div className={styles.empty}>
                    <p>No performance data yet</p>
                </div>
            ) : (
                <div className={styles.reports}>
                    {Object.entries(gpuGroups).slice(0, 5).map(([gpu, gpuReports]) => {
                        const avgFps = gpuReports.reduce((acc, r) => acc + r.avgFps, 0) / gpuReports.length
                        return (
                            <div key={gpu} className={styles.reportRow}>
                                <span className={styles.gpuName}>{gpu}</span>
                                <div className={styles.fpsBar}>
                                    <div
                                        className={styles.fpsFill}
                                        style={{ width: `${Math.min(avgFps / 1.2, 100)}%` }}
                                    ></div>
                                </div>
                                <span className={styles.fpsValue}>{Math.round(avgFps)} FPS</span>
                                <span className={styles.reportCount}>({gpuReports.length})</span>
                            </div>
                        )
                    })}
                </div>
            )}

            {isLoggedIn && !showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className={styles.addBtn}
                >
                    + Add Your Performance Data
                </button>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                        <select
                            value={formData.gpu}
                            onChange={(e) => setFormData(prev => ({ ...prev, gpu: e.target.value }))}
                            className={styles.select}
                            required
                        >
                            <option value="">Select GPU</option>
                            {GPU_OPTIONS.map(gpu => (
                                <option key={gpu} value={gpu}>{gpu}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="CPU (e.g., Ryzen 5 5600X)"
                            value={formData.cpu}
                            onChange={(e) => setFormData(prev => ({ ...prev, cpu: e.target.value }))}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formRow}>
                        <select
                            value={formData.resolution}
                            onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
                            className={styles.select}
                        >
                            {RESOLUTION_OPTIONS.map(res => (
                                <option key={res} value={res}>{res}</option>
                            ))}
                        </select>
                        <select
                            value={formData.settings}
                            onChange={(e) => setFormData(prev => ({ ...prev, settings: e.target.value }))}
                            className={styles.select}
                        >
                            {SETTINGS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Avg FPS"
                            value={formData.avgFps}
                            onChange={(e) => setFormData(prev => ({ ...prev, avgFps: e.target.value }))}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formActions}>
                        <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                            Submit
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
