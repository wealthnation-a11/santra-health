

## Plan: API Integrations Section in Settings (Coming Soon)

### Overview
Add an "Integrations" card to the Settings page with a grid of health/wellness service integrations. All integrations show a "Coming Soon" toast when clicked. Premium integrations show a lock icon for free users.

### 1. Database Migration
Create `user_integrations` table to persist connection state (for future use):
```sql
CREATE TABLE public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, integration_key)
);
-- RLS: users can SELECT, INSERT, UPDATE their own rows
```

### 2. New Component: `IntegrationsCard.tsx`
- Follows existing Settings card pattern (icon header, rounded card)
- Grid of integrations: Google Fit, Apple Health, Fitbit, Google Calendar, MyFitnessPal, Pharmacy Locator
- Each row: icon, name, description, and a "Connect" button
- Premium integrations show a lock/crown badge for free users
- **All buttons trigger a "Coming Soon" toast on click** (using existing `sonner` toast)
- Uses `useSubscription` to determine which integrations show "Premium" badge

### 3. Modified: `Settings.tsx`
- Import and render `IntegrationsCard` between Health Profile and Appearance sections

### Files
| Action | File |
|---|---|
| Create | `src/components/settings/IntegrationsCard.tsx` |
| Migration | `user_integrations` table + RLS |
| Modify | `src/pages/Settings.tsx` (add card) |

