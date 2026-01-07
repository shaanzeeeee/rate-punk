# RatePunk 🎮

A cyberpunk-themed video game rating and review platform built with Next.js 16.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)

## Features

### Core Platform
- 🔐 User authentication (registration & login)
- 🎮 Game database with cover art
- ⭐ Community ratings and reviews
- 🎨 Cyberpunk aesthetic (neon colors, glow effects, animations)

### Crowdsourced Data
- 💰 **Greed Score** - Rate monetization aggressiveness (1-10)
- 🖥️ **Performance Reports** - GPU/CPU + FPS benchmarks
- ⏱️ **Time to Beat** - Community playtime estimates
- ♿ **Accessibility Wiki** - Vote on accessibility features

### Smart Features
- 🔄 **Patch-aware reviews** - Reviews tagged by game version
- 🏷️ **Community tags** - Weighted vibe-based search

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma ORM
- **Auth**: NextAuth.js v5
- **Styling**: CSS Modules + Custom CSS

## Getting Started

```bash
# Install dependencies
npm install

# Set up database
npx prisma db push

# Seed sample data
npx tsx prisma/seed.ts

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `env.template` to `.env`:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"
```

## Screenshots

### Homepage
Cyberpunk hero section with neon gradients and animated grid.

### Games Listing
Cards with ratings, greed scores, and community tags.

### Game Details
Full metrics including performance reports and accessibility voting.

## License

MIT
