import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { gameId, content, rating, greedScore, playtimeHours, gameVersion } = await request.json()

        if (!gameId || !content || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const review = await prisma.review.create({
            data: {
                userId: session.user.id,
                gameId,
                content,
                rating,
                greedScore: greedScore || null,
                playtimeHours: playtimeHours || null,
                gameVersion: gameVersion || null,
            }
        })

        return NextResponse.json({ review }, { status: 201 })
    } catch (error) {
        console.error('Review creation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
