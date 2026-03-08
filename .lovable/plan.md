

## Admin Panel Plan

### Overview
Build a comprehensive admin panel at `/admin` with a dashboard and management views to monitor users, subscriptions, conversations, and system usage. Access will be role-gated using a `user_roles` table with RLS-safe security definer functions.

### 1. Database Changes

**Create `user_roles` table** with enum-based roles:
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

**Security definer function** to check roles without RLS recursion:
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
```

**RLS policies** on `user_roles`: admins can read all, users can read their own.

**Create admin-facing database views/functions** (security definer) to aggregate:
- Total users count, new users today/this week/this month
- Active subscriptions by plan type and tier
- Daily message volume
- Revenue approximation from subscription counts

### 2. Edge Function: `admin-stats`
A new edge function that verifies the caller is an admin (via `has_role`), then queries aggregate stats using the service role client:
- **Users**: total, new today, by country (top 10)
- **Subscriptions**: count by plan (free/premium/edu_starter/edu_pro), active vs inactive
- **Messages**: total, today's count, average per user
- **Voice usage**: total this month
- **Conversations**: total, library vs general split

### 3. New Files

| File | Purpose |
|---|---|
| `src/pages/Admin.tsx` | Main admin layout with sidebar navigation |
| `src/pages/admin/AdminDashboard.tsx` | Overview cards + charts (users, revenue, messages) |
| `src/pages/admin/AdminUsers.tsx` | Paginated user list with search, view profiles |
| `src/pages/admin/AdminSubscriptions.tsx` | Subscription list with filters by plan type/tier |
| `src/pages/admin/AdminConversations.tsx` | Conversation browser (metadata only, not content) |
| `src/pages/admin/AdminMessages.tsx` | Message volume analytics |
| `src/components/AdminRoute.tsx` | Route guard checking `has_role(uid, 'admin')` |
| `src/hooks/useAdminStats.tsx` | Hook calling the `admin-stats` edge function |
| `supabase/functions/admin-stats/index.ts` | Aggregation queries |

### 4. Admin Dashboard Features

**Overview Cards**: Total users, active subscriptions (chat + edu), messages today, revenue estimate

**Charts** (using recharts, already installed):
- User signups over time (line chart)
- Messages per day (bar chart)  
- Subscription distribution (pie chart)
- Top countries (horizontal bar)

**Users Table**: Searchable, sortable list showing name, email, country, signup date, plan status. Click to view profile details.

**Subscriptions Table**: Filter by plan_type (chat/edu), plan tier, status. Shows user, plan, created date.

**Conversations View**: Shows conversation count per user, library vs general breakdown. No message content exposed (privacy).

### 5. Route & Access

- Add `/admin` route in `App.tsx` wrapped in `AdminRoute`
- `AdminRoute` component queries `user_roles` for admin role, redirects non-admins to `/chat`
- No visible link to admin panel in the main UI — accessed directly via URL
- You'll need to manually insert your user ID into `user_roles` with role `'admin'` to bootstrap access

### 6. Files Modified

| Action | File |
|---|---|
| Migration | Create `user_roles` table, `app_role` enum, `has_role` function |
| Create | `src/components/AdminRoute.tsx` |
| Create | `src/hooks/useAdminStats.tsx` |
| Create | `src/pages/Admin.tsx` |
| Create | `src/pages/admin/AdminDashboard.tsx` |
| Create | `src/pages/admin/AdminUsers.tsx` |
| Create | `src/pages/admin/AdminSubscriptions.tsx` |
| Create | `src/pages/admin/AdminConversations.tsx` |
| Create | `supabase/functions/admin-stats/index.ts` |
| Modify | `src/App.tsx` — add admin routes |
| Modify | `supabase/config.toml` — add admin-stats function config |

