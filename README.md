# AI Trivia Arena

Next.js 14 App Router experience powered by Supabase, OpenAI, Tailwind CSS, and reusable UI components. Launch a cosmic-themed trivia arena with AI-generated questions, TTS, and game HUD.

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Configure environment variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
```

3. Run the dev server

```bash
npm run dev
```

## Project Structure
- `app/` – App Router pages and API routes
- `components/` – Reusable global and game components
- `lib/` – Supabase client helpers
- `styles/` – Tailwind and global styles

## API Endpoints
- `POST /api/generate-question` – Generate and persist a question via OpenAI
- `POST /api/generate-speech` – TTS and storage upload
- `POST /api/submit-answer` – Validate answers and update score/streak
- `POST /api/update-user-settings` – Save player preferences
