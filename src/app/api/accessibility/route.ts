import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const {
            gameId,
            colorblindMode = false,
            subtitles = false,
            remappableKeys = false,
            difficultyModes = false,
            screenReader = false,
            onHandedMode = false,
        } = await request.json()

        if (!gameId) {
            return NextResponse.json({ error: 'Missing game ID' }, { status: 400 })
        }

        const vote = await prisma.accessibilityVote.create({
            data: {
                gameId,
                userId: session.user.id,
                colorblindMode,
                subtitles,
                remappableKeys,
                difficultyModes,
                screenReader,
                onHandedMode,
            }
        })

        return NextResponse.json({ vote }, { status: 201 })
    } catch (error) {
        console.error('Accessibility vote error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
