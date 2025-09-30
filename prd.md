## 1. One-liner

Nova is an LLM chat web app that plants trees as you use it—like Ecosia for AI.

## 2. Goals

- Streamed chat with a cheap default model (Claude Haiku via OpenRouter).
- Persisted conversations with auto-generated titles.
- Image upload in prompts.
- Per-user tree counter and sitewide counter with transparent impact tracking.
- Daily automated settlement to purchase whole trees via Ecologi API.

## 3. Non-goals (MVP)

- Organizations/teams, billing, model marketplace, advanced memory, plugins, conversation search, custom model selection, rate limit UI, analytics dashboard.

## 4. Success metrics

- **Engagement**: 100 conversations created in first month.
- **Retention**: 20% of users return within 7 days.
- **Impact**: 50 trees planted in first month.
- **Transparency**: Public impact page viewed 500+ times in first month.

## 5. Key user flows

### First-time user

1. Land on homepage → see sitewide tree counter and recent impact
2. Click "Start chatting" → magic link email auth
3. Create first conversation → send message with/without image
4. Receive streamed AI response
5. See toast: "🌱 You just planted 0.03 trees" + counter updates
6. Click sitewide counter → view public transparency page with receipts

### Returning user

1. Sign in → see conversation list in left rail
2. Resume existing conversation or start new one
3. Continue chatting → watch personal tree counter grow

### Trust/transparency flow

1. Any visitor (logged out) can view `/impact` page
2. See: total trees planted, total users, recent Ecologi purchase receipts
3. Link to Nova's Ecologi forest profile

## 6. UX requirements

### Layout (Claude-inspired)

- **Clean, spacious design**: More vertical padding between messages (~24px vs ChatGPT's ~16px)
- **Typography**: Base font size 16px, line-height 1.6 for readability
- **Left rail**: Collapsible conversation list, newest first
- **Header**: User tree counter (left), sitewide counter (right), both clickable
- **Input**: Bottom-anchored, auto-expands on focus, attach image button
- **Messages**: Clean markdown rendering, no avatars, subtle fade-in animation on stream
- **Mobile**: Hamburger menu for conversation list, full-screen chat area

### Tree counter display

- Show fractional trees with 2 decimals: "You've planted **3.47 trees**"
- Toast after each completion: "🌱 +0.03 trees planted"
- Header shows: "Your trees: 3.47" and "Nova trees: 1,284.56"
- Click your counter → modal with personal stats
- Click sitewide counter → navigate to `/impact` page

### Conversation management

- Auto-generated titles from first user message (first 50 chars, or LLM-generated summary)
- Delete conversation (with confirmation)
- No search or archive in MVP

### Public impact page (`/impact`)

- Hero: "🌳 Nova has planted **1,284** trees with Ecologi"
- Stats cards: Total trees (rounded down to whole), total users, trees this month
- Receipt list: Recent Ecologi purchases with date, quantity, receipt URL
- Link to Ecologi forest profile
- Updated daily after settlement runs

## 7. Architecture

### Stack

- **Frontend/Backend**: Next.js 14 App Router, TypeScript, deployed on Vercel
- **Auth**: Supabase Auth (magic link only)
- **Database**: Supabase Postgres with Row Level Security
- **Storage**: Supabase Storage (via UploadThing helper)
- **LLM**: OpenRouter API (default model: `anthropic/claude-3-haiku`)
- **Tree purchases**: Ecologi API
- **UI**: Tailwind CSS + shadcn/ui components
- **Cron**: Vercel Cron for daily settlement

### Edge cases & resilience

- **OpenRouter down**: Show error toast, allow retry, don't charge trees
- **Stream interrupted**: Mark message as failed, don't record usage_event
- **Ecologi settlement fails**: Log error, retry next day, accumulate outstanding trees
- **Idempotency**: Use `message_id` + `completion_timestamp` as idempotency key

## 8. Data model

```sql
-- Profiles
profiles (
  id uuid primary key references auth.users,
  email text,
  created_at timestamp,
  trees_total numeric(10,2) default 0
)

-- Conversations
conversations (
  id uuid primary key,
  user_id uuid references profiles(id),
  title text,
  created_at timestamp,
  updated_at timestamp
)

-- Messages
messages (
  id uuid primary key,
  conversation_id uuid references conversations(id),
  role text, -- 'user' | 'assistant'
  content text,
  image_url text nullable,
  tokens_in int,
  tokens_out int,
  created_at timestamp
)

-- Usage events (idempotent tree recording)
usage_events (
  id uuid primary key,
  user_id uuid references profiles(id),
  message_id uuid references messages(id),
  idempotency_key text unique, -- message_id + completion hash
  tokens_in int,
  tokens_out int,
  trees_delta numeric(10,4),
  created_at timestamp
)

-- Counters (single row, updated atomically)
counters (
  id int primary key default 1,
  trees_total numeric(10,2) default 0,
  trees_pending numeric(10,2) default 0,
  updated_at timestamp,
  check (id = 1) -- ensure single row
)

-- Purchases (Ecologi receipts)
purchases (
  id uuid primary key,
  trees_purchased int,
  ecologi_receipt_url text,
  ecologi_transaction_id text,
  purchased_at timestamp
)

```

**RLS policies**: All app tables (profiles, conversations, messages, usage_events) have policies enforcing `user_id = auth.uid()` for SELECT, INSERT, UPDATE, DELETE.

## 9. APIs

### POST `/api/chat`

- **Runtime**: Node.js (streaming)
- **Input**: `{ conversationId, message, imageUrl? }`
- **Flow**:
    1. Validate auth
    2. Insert user message into `messages`
    3. Stream OpenRouter completion
    4. On completion: calculate tokens, generate idempotency key
    5. Insert assistant message
    6. Insert `usage_events` row (idempotent on key)
    7. Atomically increment `profiles.trees_total` and `counters.trees_total` + `counters.trees_pending`
    8. Return trees_delta in response
- **Error handling**: If stream fails mid-completion, rollback and don't record usage

### GET `/api/counter`

- **Output**: `{ userTrees: 3.47, siteTrees: 1284.56, treesPending: 12.34 }`

### POST `/api/uploadthing`

- Handles image upload to Supabase Storage
- Returns signed URL for use in chat
- **Limits**: 5MB max, JPEG/PNG only
- **Retention**: Images stored indefinitely (delete on conversation delete)

### POST `/api/settle`

- **Auth**: Admin API key or Vercel Cron secret
- **Schedule**: Daily at 00:00 UTC
- **Flow**:
    1. Read `counters.trees_pending`
    2. If >= 1.0 whole trees:
        - Calculate `trees_to_buy = floor(trees_pending)`
        - Call Ecologi API to purchase `trees_to_buy`
        - Insert into `purchases` with receipt URL
        - Decrement `counters.trees_pending` by `trees_to_buy`
    3. If Ecologi fails: log error, skip decrement, retry tomorrow
- **Output**: `{ success: true, treesPurchased: 10, receiptUrl: "..." }`

### GET `/api/healthz`

- Returns `{ status: "ok", openrouterConfigured: true, ecologiConfigured: true }`

## 10. Tree math (v1 formula)

```
TREES_PER_1K_TOKENS = 0.01

trees_delta = TREES_PER_1K_TOKENS * ceil((tokens_in + tokens_out) / 1000)

```

**Example**:

- User sends 150 tokens, receives 850 tokens = 1,000 total
- trees_delta = 0.01 * ceil(1000/1000) = 0.01 trees

**Rationale**: Simple, predictable, adjustable later based on cost/revenue data.

## 11. Model configuration

### Default model

- `anthropic/claude-3-haiku` via OpenRouter
- ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- Fast, affordable, good quality for MVP

### Future upgrade path (post-MVP)

- Per-conversation model selector (Haiku, Sonnet, GPT-4, etc.)
- Premium models cost more trees or require subscription
- For MVP: single model keeps things simple

## 12. Rate limiting (MVP approach)

- **Per user**: 100 messages per day (soft limit, toasted warning at 90)
- **No token limit** in MVP (trust + monitoring)
- **Abuse prevention**: If `trees_total` growth rate is anomalous, flag for manual review

## 13. Acceptance criteria

### Core functionality

- [ ]  Build passes with dummy env vars
- [ ]  Magic link sign-in works end-to-end
- [ ]  User can create conversation, send message (text only), receive streamed reply
- [ ]  User can attach image, it uploads successfully, and is referenced in prompt
- [ ]  Exactly one `usage_events` row per completion with unique idempotency key
- [ ]  `profiles.trees_total` and `counters.trees_total` increment exactly once per completion
- [ ]  Toast displays correct trees_delta after each reply

### UI/UX

- [ ]  Conversation list shows in left rail (collapsible on mobile)
- [ ]  Header displays user tree count and sitewide tree count
- [ ]  Messages render with Claude-like spacing and typography
- [ ]  Mobile view works (hamburger menu, full-screen chat)

### Tree system

- [ ]  `/api/counter` returns accurate user and site trees
- [ ]  `/api/settle` successfully purchases N whole trees from Ecologi
- [ ]  Purchase receipt stored in `purchases` table
- [ ]  `/impact` page displays total trees, user count, recent receipts

### Resilience

- [ ]  Duplicate message (same idempotency key) doesn't double-count trees
- [ ]  Stream interruption doesn't record usage_event
- [ ]  Ecologi API failure logs error and doesn't corrupt counter state
