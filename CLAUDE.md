# Nova Project - Claude Context

## Project Overview
Nova is an LLM chat web app that plants trees as you use it—like Ecosia for AI. This is a Next.js 14 application with TypeScript, following the detailed PRD.md specifications.

## Current Status: ✅ Foundation Complete
The project has successfully completed the initial setup phase with full environment configuration and health monitoring.

## Architecture & Tech Stack
- **Frontend/Backend**: Next.js 14 App Router with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase Postgres with Row Level Security
- **Authentication**: Supabase Auth (magic link)
- **LLM Provider**: OpenRouter API (Claude Haiku default)
- **Tree Purchases**: Ecologi API
- **File Uploads**: UploadThing
- **Deployment**: Vercel (planned)

## Project Structure
```
Nova/
├── .env.local.example          # Environment template
├── .env.local                  # Real credentials (gitignored)
├── prd.md                      # Product Requirements Document
├── app/
│   ├── api/healthz/route.ts    # Enhanced health check endpoint
│   ├── globals.css             # Tailwind + shadcn styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Homepage placeholder
├── src/
│   ├── env.ts                  # Safe environment validation
│   └── lib/
│       └── supabase.ts         # Browser & server clients
├── lib/
│   └── utils.ts                # shadcn utilities (cn function)
├── components.json             # shadcn/ui configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

## Development Environment
- **Node.js**: Pinned to version 20.18.0
- **Package Manager**: npm
- **Dev Server**: http://localhost:3001 (or 3000)
- **Health Check**: http://localhost:3001/api/healthz

## Environment Variables (All Configured ✅)
All API keys are properly configured in `.env.local` (not tracked by git). See `.env.local.example` for the complete structure.

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENROUTER_API_KEY` - OpenRouter API key for LLM access
- `ECOLOGI_API_KEY` - Ecologi API key for tree purchases
- `UPLOADTHING_SECRET` - UploadThing secret key
- `UPLOADTHING_APP_ID` - UploadThing app identifier

## Key Features Implemented

### 1. Safe Environment Contract (`src/env.ts`)
- **`getEnvSoft()`**: Returns environment variables with boolean flags, never throws
- **`getEnvStrict(required[])`**: Validates specific service groups, throws if missing
- **Service Groups**: 'supabase', 'openrouter', 'ecologi', 'uploadthing'
- **Build Safety**: Never crashes at build time, only validates at runtime

### 2. Supabase Integration (`src/lib/supabase.ts`)
- **Browser Client**: For client-side operations
- **Server Client**: For API routes with cookie handling
- **Authentication Ready**: Uses anon key with RLS policies
- **Database Connectivity**: Verified working connection

### 3. Enhanced Health Check (`app/api/healthz/route.ts`)
Returns comprehensive system status:
```json
{
  "ok": true,
  "env": {
    "supabase": true,
    "openrouter": true,
    "ecologi": true,
    "uploadthing": true
  },
  "db": {
    "reachable": true,
    "time": "2025-09-30T21:28:01.900Z"
  }
}
```

## npm Scripts
```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint validation
npm run typecheck  # TypeScript validation
```

## Git Status
- **Main Branch**: Basic Next.js setup
- **Feature Branch**: `feature/env-contract-supabase-healthcheck`
- **Pull Requests**:
  - #1: Initial Next.js setup
  - #2: Environment contract & Supabase integration
- **Security**: `.env.local` properly gitignored, only `.env.local.example` tracked

## Completed Tasks ✅
1. **Project Setup**: Next.js 14 + TypeScript + Tailwind + shadcn/ui
2. **Environment Management**: Safe validation system with runtime checks
3. **Supabase Integration**: Browser/server clients with working database connection
4. **Health Monitoring**: Comprehensive endpoint for system status
5. **Build Validation**: Passes with real and missing environment variables
6. **Security**: Proper gitignore for secrets, example template provided

## Database Schema (From PRD.md)
Key tables to implement:
- **profiles**: User data with tree counters
- **conversations**: Chat sessions with auto-generated titles
- **messages**: User/assistant messages with token tracking
- **usage_events**: Idempotent tree calculations
- **counters**: Global tree totals (atomic updates)
- **purchases**: Ecologi transaction receipts

## Tree Calculation Formula
```
TREES_PER_1K_TOKENS = 0.01
trees_delta = TREES_PER_1K_TOKENS * ceil((tokens_in + tokens_out) / 1000)
```

## Next Implementation Steps (Priority Order)

### Phase 1: Core Chat Functionality
1. **Database Setup**:
   - Run Supabase migrations for core tables
   - Set up Row Level Security policies
   - Initialize counters table

2. **Authentication System**:
   - Magic link auth with Supabase
   - User profile creation
   - Session management

3. **Chat Interface**:
   - Claude-inspired UI layout with left rail
   - Message components with proper spacing
   - Streaming response handling
   - Auto-expanding input field

### Phase 2: LLM Integration
4. **OpenRouter Integration**:
   - POST `/api/chat` endpoint with streaming
   - Claude Haiku model configuration
   - Token counting and usage tracking
   - Idempotent message processing

5. **Tree System**:
   - Usage event recording with idempotency
   - User and global tree counter updates
   - Toast notifications for tree planting
   - GET `/api/counter` endpoint

### Phase 3: Advanced Features
6. **File Upload**:
   - UploadThing integration for images
   - Image handling in chat prompts
   - File size and type validation

7. **Tree Purchasing**:
   - POST `/api/settle` for daily Ecologi purchases
   - Purchase receipt storage
   - Vercel Cron job setup

8. **Public Impact Page**:
   - `/impact` route for transparency
   - Public statistics display
   - Ecologi receipt links

### Phase 4: Polish & Deploy
9. **Mobile Optimization**:
   - Responsive design implementation
   - Hamburger menu for conversation list
   - Touch-friendly interactions

10. **Production Deployment**:
    - Vercel deployment configuration
    - Environment variable setup
    - Domain configuration
    - Performance monitoring

## Development Workflow
```bash
# Start development
cd /Users/joeom/Nova
npm run dev

# Test health status
curl http://localhost:3001/api/healthz

# Build verification
npm run build
npm run typecheck
npm run lint

# Git workflow
git checkout main
git pull origin main
git checkout -b feature/new-feature
# ... make changes ...
git add .
git commit -m "feat: description"
git push origin feature/new-feature
gh pr create
```

## Important Notes
- **PRD.md is the source of truth** for all features and requirements
- **No build crashes**: Environment validation only at runtime
- **Supabase RLS**: All tables require user-scoped policies
- **Idempotency**: Critical for tree counting accuracy
- **Claude UI inspiration**: Spacious design with 24px message spacing
- **Mobile-first**: Responsive design from the start

## Testing Strategy
- **Health endpoint**: Validates all service connections
- **Environment resilience**: Build passes with missing variables
- **Database connectivity**: Real Supabase connection verified
- **Type safety**: Full TypeScript coverage
- **API contracts**: Consistent request/response formats

## Current Development Server
The server is running on http://localhost:3001 with all environment variables loaded and services connected. Ready for feature development!

---

*This document should be updated as features are implemented. Always refer to PRD.md for detailed requirements and acceptance criteria.*