# CRM System

A professional Customer Relationship Management (CRM) system built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React 18** - UI library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
├── app/              # Next.js App Router directory
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page
│   └── globals.css  # Global styles
├── components/       # React components (to be created)
├── lib/             # Utility functions (to be created)
├── public/          # Static assets
└── types/           # TypeScript type definitions (to be created)
```

## Environment Variables

Create a `.env.local` file in the root directory (see `.env.example` for reference):

```env
NEXT_PUBLIC_API_BASE_URL=https://democrm-rsqo.onrender.com
```

**Note**: For Vercel deployment, add these environment variables in the Vercel dashboard under Settings → Environment Variables.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions to Vercel.

## License

Private - All rights reserved




