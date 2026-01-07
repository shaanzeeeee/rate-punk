import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { gameId, gpu, cpu, resolution, avgFps, settings } = await request.json()

        if (!gameId || !gpu || !cpu || !avgFps) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const report = await prisma.performanceReport.create({
            data: {
                gameId,
                userId: session.user.id,
                gpu,
                cpu,
                resolution: resolution || '1080p',
                avgFps,
                settings: settings || 'High',
            }
        })

        return NextResponse.json({ report }, { status: 201 })
    } catch (error) {
        console.error('Performance report error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
