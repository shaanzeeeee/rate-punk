import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { title, slug, description, coverUrl, genre } = await request.json()

        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
        }

        // Check if game already exists
        const existing = await prisma.game.findUnique({ where: { slug } })
        if (existing) {
            return NextResponse.json({
                error: 'Game already exists',
                game: existing
            }, { status: 409 })
        }

        // Create new game
        const game = await prisma.game.create({
            data: {
                title,
                slug,
                description: description || null,
                coverUrl: coverUrl || null,
                genre: genre || null,
            }
        })

        return NextResponse.json({ game }, { status: 201 })
    } catch (error) {
        console.error('Game import error:', error)
        return NextResponse.json({ error: 'Failed to import game' }, { status: 500 })
    }
}
