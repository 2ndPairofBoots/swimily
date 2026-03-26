Perfect idea. Here’s a copy/paste “master context prompt” you can give any AI so it understands your app in full detail.

You are helping me continue development of my Expo + TypeScript app called **Swimily**.
## Project Identity
- App name: `Swimily`
- Domain: swim training tracker + analytics + AI workout tools
- Primary goals:
  - Track practices, sets, yards, and times
  - Compute swim performance metrics (FINA points, cuts)
  - Provide AI-powered OCR workout parsing and AI workout generation
  - Include gamification (XP, levels, streaks, rewards spin wheel)
  - Support premium features (RevenueCat integration)
---
## Current Workspace State (Important)
I have a Windows workspace at `C:\Users\Alex\swimily`.
There are now potentially **two project trees** because of in-place Expo scaffolding:
- Newly created Expo project in: `C:\Users\Alex\swimily` (root)
- Older existing project restored inside: `C:\Users\Alex\swimily\swimily`
So before any edits:
1. Determine which tree is the active one I want to keep.
2. Do not accidentally mix files across both trees.
3. Do not delete or overwrite data unless explicitly asked.
Also, there are instruction/reference docs in root:
- `ai-integration.md`
- `components-guide.md`
- `cursorrules`
- `database-schema.md`
- `overview.md`
- `supabase/` (restored)
---
## Tech Stack
- Expo + React Native + TypeScript
- Expo Router (file-based routing)
- NativeWind + Tailwind-style utility classes
- Supabase (Auth, DB, Storage, Edge Functions)
- TanStack Query
- Zustand
- RevenueCat (`react-native-purchases`)
- Expo modules:
  - camera, image-picker, crypto, haptics, notifications, updates
- AI provider:
  - Gemini (`gemini-2.0-flash`) via Supabase Edge Functions (Deno)
---
## Routing / Screen Structure
Expected app route architecture includes:
- `app/_layout.tsx` (root layout with QueryClient + auth routing + Toast + error boundary)
- `app/(auth)/_layout.tsx`
- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `app/(auth)/onboarding.tsx`
- `app/(tabs)/_layout.tsx` (Ionicons tabs)
- `app/(tabs)/index.tsx` (Dashboard)
- `app/(tabs)/log.tsx`
- `app/(tabs)/records.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/more.tsx`
- Additional routes:
  - `app/calendar.tsx`
  - `app/meets.tsx`
  - `app/race-splits.tsx`
  - `app/dryland.tsx`
  - `app/analytics.tsx`
  - `app/ai-trainer.tsx`
  - `app/rewards.tsx`
  - `app/taper.tsx`
---
## Core Libraries / Files
### Config
- `tailwind.config.js`
- `babel.config.js`
- `metro.config.js`
- `global.css`
- `nativewind-env.d.ts`
- `.env`
- `app.json` with production config
- `eas.json`
- `README.md`
- `docs/revenuecat-setup.md`
### State / API
- `lib/supabase.ts`
- `lib/query-client.ts`
- `store/auth-store.ts`
- `store/ui-store.ts` (+ `useToast` helper)
### Types + Constants + Utils
- `lib/types.ts` with strict domain models (Profile, Practice, PracticeSet, SwimTime, GoalTime, Meet, AIWorkout, etc.)
- `lib/constants.ts` with:
  - levels, XP constants
  - strokes/effort/focus options
  - WR tables (SCY/LCM M/F)
  - event groupings
  - cut order + standards (SCY/LCM M/F)
  - equipment lists
  - dryland workouts
  - pacing profiles
  - distance arrays
  - spin prizes
- `lib/swim-utils.ts`:
  - level/progress helpers
  - time parse/format
  - FINA + cut calculations
  - yards calculators
  - streak logic
- `lib/workout-parser.ts`:
  - parse freeform text into structured sets
---
## Reusable UI Components
Under `components/ui/`:
- `Button`
- `Input`
- `Toast`
- `Card`
- `Badge`
- `ProgressBar`
- `Skeleton`
- `EmptyState`
- `Modal`
Feature components include:
- Dashboard: `StatCard`, `XPCard`
- Practice: `SetRow`, `SetEditor`, `PhotoScanButton`
- Records: `CutBadge`, `EventRow`
- Rewards: `SpinWheel`
- Premium: `components/features/PremiumGate.tsx`
---
## Hooks
Expected hooks:
- `hooks/useAuth.ts`
- `hooks/useProfile.ts`
- `hooks/usePractices.ts`
- `hooks/useRecords.ts`
- `hooks/useXP.ts`
- `hooks/useGenerateWorkout.ts`
- `hooks/usePremium.ts` (real RevenueCat version replaced stub)
Behavior highlights:
- Query + mutation patterns through TanStack Query
- Supabase-backed fetch + invalidate
- Toast-based mutation error handling
- Haptics on key actions
- `refetch` exposure added on some hooks
- Type-safe returns
---
## Implemented Feature Expectations by Screen
### Auth
- Login: email/password sign in + validation + toast
- Register: full field validation + onboarding redirect
- Onboarding: 3-step wizard writing to `profiles`
### Dashboard
- Greeting, XP card, stat cards, recent practices
- Best-event/cuts sections with placeholders where needed
- Loading skeletons + error `EmptyState`
### Log Practice
- Manual + Paste Text + Photo Scan tab
- Parse text to sets
- Editable set list with yard totals
- Save practice + XP flow
- Photo scan premium gate + OCR flow
### Records
- Course/gender/group filters
- Debounced upsert of times and goal times
- FINA/cut display per event row
- Loading skeletons + error states
### Calendar
- Grid/list modes
- Monthly practice/yard aggregation
- Day selection detail panel
- Loading skeleton grid + error state
### Meets
- Add/delete meet
- Upcoming/past split
- Meet type badges
- Empty state + haptic on delete
### Race Splits
- Goal time input
- Pacing profile split calculation
- Target vs cumulative vs actual vs diff
### Dryland
- Push/Pull/Legs programming
- Equipment-aware availability
- XP logging
### Analytics (Premium)
- Inline premium gate if not premium
- Season stats
- Weekly + trend charts
- Time-of-day distribution
- Top swims by FINA
### AI Trainer (Premium)
- Inline premium gate if not premium
- Contextual generation form
- Calls generate-workout edge function
- Expandable AI workout sections + notes
### Rewards (Premium-ish flow + spin conditions)
- XP/level card
- Weekly spin eligibility logic
- Spin wheel animation + result handling
- Challenge/badges sections
---
## Supabase Edge Functions (Deno)
### `supabase/functions/ocr-scan/index.ts`
Implements:
- OPTIONS preflight + CORS
- JWT auth via service role `auth.getUser`
- Input: `{ storage_path, image_hash }`
- Cache check (`ocr_scan_cache`)
- Daily rate limit (10/day)
- Storage download from `workout-scans`
- Base64 conversion
- Gemini OCR prompt + request
- Parse Gemini JSON output
- Insert cache row
- Return JSON result
### `supabase/functions/generate-workout/index.ts`
Implements:
- OPTIONS preflight + CORS
- JWT auth
- Input: `{ workout_type, focus, duration_minutes, notes }`
- Fetch profile + last 5 practices
- Prompt construction with profile/training context
- Cache by week/type/focus/duration/notes prefix
- Daily rate limit (5/day)
- Gemini JSON generation
- Parse + cache upsert in `ai_workout_cache`
- Return generated workout
---
## Error Handling / UX Standards
- Global error boundary in root layout with reload action (`expo-updates`)
- Query screens should display:
  - Loading skeleton states
  - Error `EmptyState` with retry action
- Mutations should toast on error
- Haptic feedback integrated in specific success interactions:
  - practice add/delete
  - meet delete
  - spin start/complete
  - XP level-up
  - save practice press
---
## Monetization
- RevenueCat setup docs exist in `docs/revenuecat-setup.md`
- Product expected:
  - `swimily_premium_monthly`
- `usePremium` hook includes:
  - configure Purchases SDK
  - subscribe
  - restore
  - `isPremium` derived from profile
- `PremiumGate` component supports modal usage and inline gate screens
---
## Deployment / Build Metadata
- `app.json` configured with:
  - app identifiers/package IDs (`com.swimily.app`)
  - permissions and plugins
  - icon/splash paths
- `eas.json` configured with development/preview/production profiles
- Placeholder assets generated for icon/splash/adaptive icon
---
## What I need from you (AI assistant)
1. First, confirm the canonical project root (root vs nested `swimily/`).
2. Audit current files against the expected architecture above.
3. Report gaps by severity:
   - broken runtime paths/imports
   - missing files/components/hooks
   - config inconsistencies
   - data/API mismatches
4. Then implement fixes incrementally, with small verifiable steps.
5. Preserve existing logic; avoid destructive changes.
6. Keep strict TypeScript typing (no `any` unless explicitly unavoidable).
7. After each batch, run lint/type checks and summarize results.
If anything is ambiguous, ask concise targeted questions before modifying.