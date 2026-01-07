import { NextRequest, NextResponse } from 'next/server'

const RAWG_API_KEY = process.env.RAWG_API_KEY
const RAWG_BASE_URL = 'https://api.rawg.io/api'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
        return NextResponse.json({ error: 'Search query required' }, { status: 400 })
    }

    if (!RAWG_API_KEY) {
        return NextResponse.json({
            error: 'RAWG API key not configured. Add RAWG_API_KEY to your .env file.',
            help: 'Get a free key at https://rawg.io/apidocs'
        }, { status: 500 })
    }

    try {
        const response = await fetch(
            `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=12`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        )

        if (!response.ok) {
            throw new Error('RAWG API request failed')
        }

        const data = await response.json()

        const games = data.results.map((game: any) => ({
            rawgId: game.id,
            title: game.name,
            slug: game.slug,
            description: game.description_raw || '',
            coverUrl: game.background_image,
            genre: game.genres?.[0]?.name || null,
            releaseDate: game.released,
            rating: game.rating,
            platforms: game.platforms?.map((p: any) => p.platform.name) || [],
            tags: game.tags?.slice(0, 5).map((t: any) => t.name) || [],
        }))

        return NextResponse.json({ games, count: data.count })
    } catch (error) {
        console.error('RAWG API error:', error)
        return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
    }
}
