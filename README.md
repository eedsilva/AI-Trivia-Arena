# AI Trivia Arena

<div align="center">

**A real-time multiplayer trivia game powered by AI, featuring dynamic question generation, voice synthesis, and live leaderboards.**

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Core Features](#core-features)
- [API Routes](#api-routes)
- [Real-time Features](#real-time-features)
- [Game Flow](#game-flow)
- [Deployment](#deployment)
  - [Complete Step-by-Step Vercel Deployment Guide](#complete-step-by-step-vercel-deployment-guide)
  - [Deploying to Other Platforms](#deploying-to-other-platforms)
  - [Environment Variables Checklist](#environment-variables-checklist)
  - [Quick Deployment Checklist](#quick-deployment-checklist)
- [Implementation Approach](#implementation-approach)
- [Trade-offs](#trade-offs)
- [Future Improvements](#future-improvements)

---

## Overview

**AI Trivia Arena** is a modern, interactive trivia game that leverages artificial intelligence to generate unique questions in real-time. Built with Next.js 14 App Router, the application features a cosmic-themed UI, real-time leaderboards, text-to-speech capabilities, and a comprehensive scoring system with streak tracking.

Players can customize their experience with adjustable difficulty levels, choose from multiple AI-generated voices, and compete globally on real-time leaderboards that update instantly as scores change.

---

## Key Features

### Game Features
- **AI-Generated Questions**: Unique trivia questions generated on-demand using OpenAI or OpenRouter
- **Dynamic Difficulty**: Three difficulty levels (Easy, Medium, Hard) with corresponding point values
- **Streak System**: Track consecutive correct answers with visual feedback
- **Question Deduplication**: Prevents repeating questions within the same game session
- **Timer-Based Gameplay**: 30-second countdown per question with visual timer bar
- **Detailed Explanations**: Learn from AI-generated explanations after each answer

### User Experience
- **Real-time Leaderboards**: Live updates showing top players by high score or max streak
- **Voice Synthesis**: AI-powered text-to-speech reads questions aloud (powered by Deepgram)
- **Voice Preview**: Test different AI voices before starting the game
- **Persistent Settings**: User preferences saved across sessions
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Avatar System**: Personalized user profiles with avatars

### Technical Features
- **Real-time Updates**: Supabase Realtime for instant leaderboard synchronization
- **Optimistic Updates**: Immediate UI feedback with background synchronization
- **Smart Caching**: React Query for efficient data fetching and caching
- **High Score Tracking**: Only saves scores that beat previous personal bests
- **Session Management**: Fresh game sessions with persistent high scores

---

## Tech Stack

### Frontend
- **[Next.js 14.1.0](https://nextjs.org/)** - React framework with App Router
- **[React 18.2.0](https://reactjs.org/)** - UI library
- **[TypeScript 5.3.3](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 3.4.1](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Zustand 4.4.1](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[React Query (@tanstack/react-query)](https://tanstack.com/query)** - Data fetching and caching
- **[Lucide React](https://lucide.dev/)** - Modern icon library
- **[Headless UI](https://headlessui.com/)** - Unstyled, accessible components

### Backend & Services
- **[Supabase](https://supabase.com/)** - PostgreSQL database with real-time capabilities
- **[OpenAI GPT-4o](https://openai.com/)** - AI question generation
- **[OpenRouter](https://openrouter.ai/)** - Alternative AI provider
- **[Deepgram](https://deepgram.com/)** - AI text-to-speech

### Developer Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** - CSS vendor prefixing

---

## Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router (React Server/Client Components)        │
│  - Pages: Landing, Game, Profile, Settings                  │
│  - Client State: Zustand (game store, user store)          │
│  - Server State: React Query (questions, leaderboard)       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      API Routes Layer                        │
├─────────────────────────────────────────────────────────────┤
│  /api/generate-question    - AI question generation         │
│  /api/generate-speech      - TTS audio generation           │
│  /api/submit-answer        - Answer validation & scoring    │
│  /api/update-user-settings - User preferences               │
│  /api/voices               - Available TTS voices           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Integration Layer                         │
├─────────────────────────────────────────────────────────────┤
│  OpenAI/OpenRouter  - Question generation                   │
│  Deepgram           - Text-to-speech synthesis              │
│  Supabase           - Data persistence & real-time          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL                                        │
│  - users            - User profiles                         │
│  - user_settings    - User preferences                      │
│  - questions        - Generated trivia questions            │
│  - game_sessions    - Scores, streaks, max streaks         │
│  - voice_previews   - TTS voice metadata                    │
│  - leaderboard_view - Optimized leaderboard query           │
│                                                             │
│  Supabase Storage                                           │
│  - audio-files      - TTS audio storage                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Question Generation**:
   - User requests question → API route → AI provider → Save to DB → Return to client
   - Client tracks asked questions to prevent duplicates

2. **Answer Submission**:
   - User submits answer → Validate client-side → Update local state optimistically
   - Background: Send to DB → Update high scores → Trigger real-time updates

3. **Leaderboard Updates**:
   - Game session updated → Supabase Realtime → All connected clients
   - React Query cache invalidated → Fresh data fetched

4. **Voice Synthesis**:
   - Question generated → Request TTS → Deepgram API → Upload to Supabase Storage
   - Return audio URL → Browser plays audio

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

You'll also need accounts and API keys for:

- **Supabase** ([Sign up](https://supabase.com/))
- **OpenAI** ([Sign up](https://platform.openai.com/)) OR **OpenRouter** ([Sign up](https://openrouter.ai/))
- **Deepgram** ([Sign up](https://deepgram.com/)) - for text-to-speech

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-trivia-arena.git
cd ai-trivia-arena
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) section for detailed configuration.

### 4. Set Up the Database

Follow the [Database Setup](#database-setup) section to configure your Supabase database.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Question Provider (choose one or both)
# OpenAI Configuration
OPENAI_API_KEY=sk-...

# OpenRouter Configuration (alternative to OpenAI)
OPENROUTER_API_KEY=sk-or-...

# Question Provider Selection (optional, defaults to 'openai')
# Options: 'openai' or 'openrouter'
QUESTION_PROVIDER=openai

# Deepgram Configuration (for text-to-speech)
DEEPGRAM_API_KEY=your-deepgram-key

# Optional: Deepgram Voice Model (defaults to 'aura-asteria-en')
DEEPGRAM_MODEL=aura-asteria-en
```

### Getting API Keys

#### Supabase
1. Create a project at [supabase.com](https://supabase.com/)
2. Go to **Settings** → **API**
3. Copy the **Project URL** and **anon/public** key
4. Copy the **service_role** key (keep this secret!)

#### OpenAI
1. Sign up at [platform.openai.com](https://platform.openai.com/)
2. Go to **API Keys**
3. Create a new secret key
4. Copy and save it securely

#### OpenRouter (Alternative)
1. Sign up at [openrouter.ai](https://openrouter.ai/)
2. Go to **Keys**
3. Create a new API key
4. Copy and save it securely

#### Deepgram
1. Sign up at [deepgram.com](https://deepgram.com/)
2. Go to **API Keys**
3. Create a new API key
4. Copy and save it securely

---

### Development Mode

```bash
npm run dev
```

Access the app at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## Core Features

### 1. AI Question Generation

Questions are generated dynamically using either OpenAI's GPT-4o or OpenRouter's models.

**Features**:
- Three difficulty levels with customizable point values
- Unique questions every time (no pre-defined question bank)
- Questions include explanations for learning
- Client-side tracking prevents duplicate questions in a session

**Configuration**:
```typescript
// lib/constants/index.ts
export const DIFFICULTY_POINTS = {
  easy: 10,
  medium: 20,
  hard: 30,
};
```

### 2. Scoring System

**High Score Tracking**:
- Database only saves scores higher than existing personal best
- Local state tracks current session score starting from 0
- Each new session starts fresh while preserving high scores

**Streak System**:
- `streak`: Current consecutive correct answers (resets on wrong answer)
- `max_streak`: All-time highest streak achieved (never decreases)
- Leaderboard displays max streaks for fair competition

**Points**:
- Easy: 10 points
- Medium: 20 points
- Hard: 30 points

### 3. Real-time Leaderboards

**Features**:
- Live updates using Supabase Realtime
- Sortable by high score or max streak
- Top 5 players on landing page
- Top 10 players on game page
- Efficient database view with optimized queries

**Implementation**:
```typescript
// lib/supabase/realtime.ts
export const subscribeToLeaderboard = (callback: () => void) => {
  const channel = client
    .channel('leaderboard-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'game_sessions'
    }, callback)
    .subscribe();

  return channel;
};
```

### 4. Voice Synthesis

**Features**:
- Text-to-speech powered by Deepgram
- Multiple AI voice options (Aura models)
- Voice preview functionality
- Audio stored in Supabase Storage
- Automatic playback on question load

**Available Voices**:
- Aura Asteria (default)
- Aura Luna
- Aura Stella
- Aura Athena
- Aura Hera
- Aura Orion
- Aura Arcas
- Aura Perseus
- Aura Angus
- Aura Orpheus
- Aura Helios
- Aura Zeus

## API Routes

### POST /api/generate-question

Generates a new trivia question using AI.

**Request**:
```typescript
{
  difficulty: 'easy' | 'medium' | 'hard',
  excludeQuestionIds: string[] // Optional
}
```

**Response**:
```typescript
{
  id: string,
  question_text: string,
  options: string[],
  correct_answer_index: number,
  explanation: string
}
```

### POST /api/generate-speech

Generates TTS audio for a question.

**Request**:
```typescript
{
  text: string,
  voice: string
}
```

**Response**:
```typescript
{
  audioUrl: string
}
```

### POST /api/submit-answer

Validates an answer and updates score.

**Request**:
```typescript
{
  userId: string,
  questionId: string,
  selectedIndex: number,
  isCorrect: boolean,
  points: number,
  streak: number,
  maxStreak: number
}
```

**Response**:
```typescript
{
  success: boolean,
  newScore: number,
  newStreak: number
}
```

### POST /api/update-user-settings

Saves user preferences.

**Request**:
```typescript
{
  userId: string,
  difficulty: string,
  voice: string
}
```

**Response**:
```typescript
{
  success: boolean
}
```

### GET /api/voices

Returns available TTS voices.

**Response**:
```typescript
{
  voices: Array<{
    id: string,
    name: string,
    description: string
  }>
}
```

---

### React Query

Used for server state management with automatic caching and refetching:

- `useQuestion`: Fetches and caches questions
- `useLeaderboard`: Fetches and caches leaderboard data
- `useVoices`: Fetches available TTS voices
- `useGameSession`: Manages game session data

**Benefits**:
- Automatic background refetching
- Optimistic updates
- Request deduplication
- Cache management
- Error handling

---

## Real-time Features

### Supabase Realtime Integration

The app uses Supabase Realtime for instant updates across all clients.

#### Score Synchronization

Game scores are synchronized in real-time:

1. Player answers question
2. Local state updates immediately (optimistic update)
3. Score sent to database in background
4. Database update triggers Realtime event
5. All connected clients receive update
6. Leaderboards refresh automatically

---

## Game Flow

### 1. Landing Page
- Display top 5 players leaderboard
- User enters username and selects avatar
- User profile stored in database and local cache

### 2. Game Setup
- Load user settings (difficulty, voice)
- Initialize game session (score = 0, streak = 0)
- Load high score from database for display
- Reset asked questions list

### 3. Question Phase
1. Fetch question from API (based on difficulty)
2. Generate TTS audio if voice enabled
3. Display question with 4 options
4. Start 30-second countdown timer
5. Track question ID to prevent duplicates

### 4. Answer Phase
1. User selects an option or timer expires
2. Pause timer
3. Calculate points (if correct)
4. Update streak (increment or reset)
5. Update local score optimistically
6. Send answer to API for validation
7. Sync to database in background
8. Show correct answer with visual feedback

### 5. Explanation Phase
1. Display AI-generated explanation
2. User clicks "Next Question"
3. Reset for next question
4. Repeat from step 3

### 6. Score Persistence
- Database only saves if score > existing high score
- Max streak only updates if current streak > existing max
- Current session streak updates every time
- Real-time broadcast triggers leaderboard updates

---

### Environment Variables Checklist

Before deploying to ANY platform, ensure you have:

**Required:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `OPENAI_API_KEY` or `OPENROUTER_API_KEY`
- ✅ `DEEPGRAM_API_KEY`
- ✅ `QUESTION_PROVIDER` (default: 'openrouter')
**Optional:**
- `DEEPGRAM_MODEL` (default: 'aura-asteria-en')
- `NEXT_PUBLIC_DEBUG` (default: false)
---

## Implementation Approach

### Why I Built It This Way

While the original requirements specified a single-player trivia game using Supabase Edge Functions, I evolved the architecture and feature set based on several key considerations:

#### Next.js API Routes vs. Supabase Edge Functions

**Decision**: I chose Next.js API routes over Supabase Edge Functions for the backend logic.

**Reasoning**:
- **Unified Development Experience**: Keeping frontend and backend in a single Next.js monorepo simplifies development, testing, and deployment
- **Rich Ecosystem**: Access to the full Node.js ecosystem and npm packages in API routes
- **Better TypeScript Integration**: Seamless type sharing between frontend and backend without additional tooling
- **Deployment Simplicity**: Single deployment to Vercel handles both frontend and API routes automatically
- **Cold Start Performance**: Next.js API routes on Vercel typically have better cold start times than Supabase Edge Functions
- **Development Velocity**: Faster iteration cycles with hot reload for both frontend and backend code

**Trade-off**: I still leverage Supabase for what it does best (real-time updates and data persistence) while handling AI integrations in Next.js API routes where there is more flexibility.

#### Enhanced Feature Set

**Decision**: I expanded beyond the minimum viable product to include voice synthesis, multiple AI providers, and enhanced user experience features.

**Reasoning**:
- **Voice Synthesis**: Makes the experience more engaging and accessible, especially for users who prefer auditory learning
- **Multiple AI Providers**: OpenAI and OpenRouter support provides fallback options and cost optimization flexibility
- **Real-time Leaderboards**: While not required for single-player, this creates a competitive environment and encourages repeat play
- **Streak System**: Adds a gamification layer that keeps users engaged beyond just accumulating points
- **Difficulty Selection**: Allows users to customize their experience and progression path
- **Persistent Settings**: Improves UX by remembering user preferences across sessions

#### State Management Architecture

**Decision**: Hybrid approach using Zustand for client state and React Query for server state.

**Reasoning**:
- **Zustand**: Lightweight, minimal boilerplate, perfect for game state (score, streak, current question)
- **React Query**: Handles async operations, caching, and automatic refetching for server data
- **Separation of Concerns**: Clear distinction between local game state and persisted server state
- **Optimistic Updates**: React Query enables instant UI feedback while syncing with backend

#### Database Design

**Decision**: Separate tables for users, settings, questions, and game sessions with a materialized view for leaderboards.

**Reasoning**:
- **Normalization**: Prevents data duplication and maintains consistency
- **Query Performance**: Leaderboard view pre-aggregates data for fast queries
- **Scalability**: Structure supports future multi-player features or tournaments
- **Data Integrity**: Foreign key relationships ensure referential integrity

---

## Trade-offs

### Complexity vs. Features

**Trade-off**: I increased complexity significantly beyond the original requirements.

**Benefits**:
- Richer user experience with voice synthesis, avatars, and real-time leaderboards
- More engaging gameplay with streaks, difficulty levels, and persistent settings
- Production-ready application that could handle real users

**Costs**:
- More moving parts to maintain (Deepgram API, multiple AI providers, Supabase Storage)
- Larger codebase requiring more documentation and testing
- Higher ongoing costs from multiple API services

**Verdict**: For a portfolio project or real product, the added features justify the complexity. For a pure learning exercise, the simpler version would suffice.

### API Costs

**Trade-off**: Voice synthesis and AI question generation create per-request costs.

**Current Approach**:
- OpenAI GPT-4o for question generation (~$0.015 per question)
- Deepgram TTS for voice synthesis (~$0.015 per question with voice enabled)
- Supabase free tier for database and storage

**Mitigation Strategies**:
- Questions stored in database for potential future caching/reuse
- Voice synthesis optional (users can disable)
- OpenRouter fallback offers cheaper or free model options
- Could implement question caching or pre-generation for frequently used difficulties

**Future Consideration**: For high-traffic scenarios, implementing a question pool or caching strategy would significantly reduce costs.

### Edge Functions vs. Serverless Functions

**Trade-off**: Chose convenience and developer experience over edge deployment.

**What We Gained**:
- Faster development with Next.js integrated tooling
- Better debugging experience
- Simpler deployment pipeline

**What We Lost**:
- Edge Functions offer lower latency for globally distributed users
- Edge runtime has smaller bundle sizes
- Supabase Edge Functions integrate more tightly with Supabase features

**Verdict**: For a trivia game where questions take time to read, the latency difference is negligible. The developer experience wins.

### Client-Side vs. Server-Side Answer Validation

**Trade-off**: Answer validation happens client-side before submission.

**Why**:
- Correct answer must be known client-side to display it after submission
- Reduces unnecessary API calls for validation
- Faster user feedback

**Security Consideration**:
- Users could theoretically manipulate scores client-side
- For competitive play, would need server-side validation of correct_answer_index
- Current implementation prioritizes UX over strict security (acceptable for casual gameplay)

**Future Fix**: Store only question hash or encrypted correct answer, validate fully server-side.

### Real-Time Updates Implementation

**Trade-off**: Database-level real-time updates vs. application-level websockets.

**Chose**: Supabase Realtime subscribed to database changes

**Benefits**:
- No custom websocket server needed
- Automatic synchronization across all clients
- Built-in reconnection handling

**Limitations**:
- Updates trigger on any game_sessions change (more events than needed)
- All clients receive all updates (no targeted updates)

**Verdict**: Perfect fit for this use case. Simplicity and reliability outweigh minor inefficiencies.

---

## Future Improvements

### Short-Term Enhancements

#### 1. Question Caching & Deduplication
- **Problem**: Every question is freshly generated, increasing API costs and latency
- **Solution**: Implement a question pool system:
  - Cache generated questions in database
  - Serve cached questions when available
  - Generate new questions to maintain pool size
  - Add "report question" feature for quality control

#### 2. Server-Side Answer Validation
- **Problem**: Current client-side validation can be exploited
- **Solution**: Store encrypted or hashed correct answers, validate fully server-side
- **Impact**: Prevents score manipulation, enables trusted leaderboards

#### 3. Enhanced Error Handling
- **Problem**: Network failures or API timeouts can break game flow
- **Solution**:
  - Implement comprehensive retry logic with exponential backoff
  - Add fallback UI states for graceful degradation
  - Queue failed requests for background retry
  - Show clear error messages with recovery options

#### 4. Performance Optimizations
- **Image Optimization**: Lazy load avatars and images
- **Code Splitting**: Split game logic into separate chunks
- **Audio Preloading**: Prefetch next question's audio while user is answering
- **Database Indexes**: Add indexes on frequently queried fields (leaderboard view)

#### 5. Testing Suite
- **Unit Tests**: Test game logic, scoring, streak calculations
- **Integration Tests**: Test API routes with mocked external services
- **E2E Tests**: Test complete game flows with Playwright or Cypress
- **Load Testing**: Validate performance under concurrent users

### Medium-Term Features

#### 6. Multiplayer Modes
- **Head-to-Head**: Two players answer same questions simultaneously
- **Tournaments**: Bracket-style competitions with multiple rounds
- **Team Play**: Cooperative mode where team members share questions
- **Implementation**: Requires game rooms, matchmaking, and synchronized timers

#### 7. Category Selection
- **Feature**: Let users choose trivia categories (Science, History, Pop Culture, etc.)
- **Implementation**: Extend AI prompt with category constraints
- **Benefit**: Personalized experience, knowledge-specific challenges

#### 8. Progress Tracking & Analytics
- **User Dashboard**:
  - Answer accuracy by difficulty/category
  - Performance trends over time
  - Favorite categories
  - Achievement badges
- **Implementation**: Track answer history, add analytics tables

#### 9. Social Features
- **Friend System**: Add/challenge friends
- **Share Results**: Social media integration for milestone achievements
- **Comments**: Discussion on particularly interesting questions
- **Implementation**: Additional database tables for relationships and interactions

#### 10. Accessibility Improvements
- **Keyboard Navigation**: Full game playable without mouse
- **Screen Reader Support**: ARIA labels and semantic HTML
- **High Contrast Mode**: Enhanced visual accessibility
- **Configurable Timers**: Allow users to adjust time limits for accessibility needs

### Long-Term Vision

#### 11. Mobile Applications
- **React Native**: iOS and Android apps with offline support
- **PWA**: Progressive Web App with install prompts and offline caching
- **Native Features**: Push notifications for challenges, background audio

#### 12. AI Enhancements
- **Adaptive Difficulty**: AI adjusts question difficulty based on user performance
- **Personalized Questions**: Generate questions based on user interests and history
- **Explanation Quality**: Rate explanations, fine-tune prompts for better educational content
- **Voice Cloning**: Custom voice profiles for personalized narration

#### 13. Internationalization
- **Multi-Language Support**: Translate UI and generate questions in multiple languages
- **Regional Leaderboards**: Separate leaderboards by region/language
- **Cultural Adaptation**: Questions appropriate for different cultures
- **Implementation**: i18n library, LLM prompts with language parameters

### Technical Debt to Address

- **Type Safety**: Strengthen TypeScript types, eliminate `any` usage
- **Error Boundaries**: Add React error boundaries for graceful failure handling
- **Rate Limiting**: Implement API rate limiting to prevent abuse
- **Monitoring**: Add application monitoring (Sentry, LogRocket) for error tracking
- **Documentation**: Expand inline code documentation, add architecture decision records
- **Security Audit**: Penetration testing, dependency vulnerability scanning
- **Database Migrations**: Implement proper migration system for schema changes
- **Environment Management**: Better secrets management for production deployments

---
