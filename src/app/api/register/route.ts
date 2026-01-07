import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const { username, email, password } = await request.json()

        // Validate input
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        if (username.length < 3) {
            return NextResponse.json(
                { error: 'Username must be at least 3 characters' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUserByEmail) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            )
        }

        const existingUserByUsername = await prisma.user.findUnique({
            where: { username }
        })

        if (existingUserByUsername) {
            return NextResponse.json(
                { error: 'Username already taken' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            }
        })

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: { id: user.id, username: user.username, email: user.email }
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
