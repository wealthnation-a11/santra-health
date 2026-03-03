

## Plan: Daily Message Limit System (15 free messages/day)

### Overview
Add a daily message usage counter that limits free users to 15 messages per day. When the limit is reached, show an upgrade prompt instead of allowing more messages. This follows the existing `voice_usage` pattern.

### 1. Database Migration
Create a `daily_message_usage` table:
```sql
CREATE TABLE public.daily_message_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, usage_date)
);
ALTER TABLE public.daily_message_usage ENABLE ROW LEVEL SECURITY;
-- RLS: users can SELECT, INSERT, UPDATE their own rows
```

### 2. New Hook: `useMessageUsage`
- Mirrors `useVoiceUsage` pattern
- Fetches today's count from `daily_message_usage`
- Exposes: `messageCount`, `remainingMessages`, `dailyLimit`, `canSendMessage`, `incrementUsage()`
- `incrementUsage()` upserts the row for today (insert or update count +1)

### 3. Chat.tsx Integration
- Call `useMessageUsage` hook
- Before sending a message in `handleSendMessage`, check `canSendMessage`
- If limit reached, show the upgrade modal instead of sending
- Display a small usage counter in the chat input area (e.g., "12/15 messages today")

### 4. Upgrade Prompt Component
- Create `DailyLimitModal` — shows when limit is hit
- Displays usage stats, premium benefits, and a "Subscribe" button (reuses existing "Coming Soon" toast pattern from `PremiumUploadModal`)

### 5. Usage Counter in ChatInput
- Add a subtle counter below the input: "X/15 messages remaining today"
- Changes color as usage approaches the limit (green → yellow → red)

### Files to create/modify
- **New**: `supabase/migrations/..._daily_message_usage.sql`
- **New**: `src/hooks/useMessageUsage.tsx`
- **New**: `src/components/DailyLimitModal.tsx`
- **Modified**: `src/pages/Chat.tsx` — integrate limit check + pass counter
- **Modified**: `src/components/ChatInput.tsx` — display usage counter

