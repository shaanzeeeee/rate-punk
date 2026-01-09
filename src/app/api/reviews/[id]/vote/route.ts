import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id: reviewId } = await params
        const { value } = await request.json()

        // Validate vote value
        if (value !== 1 && value !== -1 && value !== 0) {
            return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 })
        }

        // Check if review exists
        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        })

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        // Can't vote on your own review
        if (review.userId === session.user.id) {
            return NextResponse.json({ error: 'Cannot vote on your own review' }, { status: 403 })
        }

        // Get existing vote if any
        const existingVote = await prisma.reviewVote.findUnique({
            where: {
                userId_reviewId: {
                    userId: session.user.id,
                    reviewId
                }
            }
        })

        // If value is 0, remove the vote
        if (value === 0) {
            if (existingVote) {
                await prisma.reviewVote.delete({
                    where: { id: existingVote.id }
                })
                // Update review upvotes count
                await prisma.review.update({
                    where: { id: reviewId },
                    data: { upvotes: { decrement: existingVote.value } }
                })
            }
            return NextResponse.json({ success: true, vote: null })
        }

        // Upsert the vote
        if (existingVote) {
            // If same vote, just return
            if (existingVote.value === value) {
                return NextResponse.json({ success: true, vote: existingVote })
            }

            // Update vote and adjust review upvotes
            const updatedVote = await prisma.reviewVote.update({
                where: { id: existingVote.id },
                data: { value }
            })

            // Adjust upvotes (remove old value, add new)
            await prisma.review.update({
                where: { id: reviewId },
                data: { upvotes: { increment: value - existingVote.value } }
            })

            return NextResponse.json({ success: true, vote: updatedVote })
        }

        // Create new vote
        const newVote = await prisma.reviewVote.create({
            data: {
                userId: session.user.id,
                reviewId,
                value
            }
        })

        // Update review upvotes count
        await prisma.review.update({
            where: { id: reviewId },
            data: { upvotes: { increment: value } }
        })

        return NextResponse.json({ success: true, vote: newVote })
    } catch (error) {
        console.error('Vote error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET - Get user's vote for a review
export async function GET(request: NextRequest, { params }: RouteParams) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ vote: null })
    }

    try {
        const { id: reviewId } = await params

        const vote = await prisma.reviewVote.findUnique({
            where: {
                userId_reviewId: {
                    userId: session.user.id,
                    reviewId
                }
            }
        })

        return NextResponse.json({ vote })
    } catch (error) {
        console.error('Get vote error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
