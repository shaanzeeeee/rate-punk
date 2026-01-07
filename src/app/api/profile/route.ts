import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const ITEMS_PER_PAGE = 5

export async function GET(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const sort = searchParams.get('sort') || 'newest'

    // Determine sort order
    let orderBy: { createdAt?: 'asc' | 'desc'; rating?: 'asc' | 'desc' } = { createdAt: 'desc' }

    switch (sort) {
        case 'oldest':
            orderBy = { createdAt: 'asc' }
            break
        case 'highest':
            orderBy = { rating: 'desc' }
            break
        case 'lowest':
            orderBy = { rating: 'asc' }
            break
        default:
            orderBy = { createdAt: 'desc' }
    }

    try {
        // Get user with review count
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                _count: {
                    select: { reviews: true }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get total count for pagination
        const totalReviews = user._count.reviews
        const totalPages = Math.ceil(totalReviews / ITEMS_PER_PAGE)

        // Get paginated reviews
        const reviews = await prisma.review.findMany({
            where: { userId: session.user.id },
            orderBy,
            skip: (page - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            include: {
                game: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        coverUrl: true,
                        genre: true,
                    }
                }
            }
        })

        return NextResponse.json({
            user,
            reviews,
            totalPages,
            currentPage: page,
        })
    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
