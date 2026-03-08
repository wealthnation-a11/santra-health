
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS: users can read their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS: admins can read all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin aggregation function: get admin stats
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'new_users_today', (SELECT count(*) FROM public.profiles WHERE created_at::date = CURRENT_DATE),
    'new_users_this_week', (SELECT count(*) FROM public.profiles WHERE created_at >= date_trunc('week', CURRENT_DATE)),
    'new_users_this_month', (SELECT count(*) FROM public.profiles WHERE created_at >= date_trunc('month', CURRENT_DATE)),
    'total_conversations', (SELECT count(*) FROM public.conversations),
    'library_conversations', (SELECT count(*) FROM public.conversations WHERE library_id IS NOT NULL),
    'general_conversations', (SELECT count(*) FROM public.conversations WHERE library_id IS NULL),
    'total_messages', (SELECT count(*) FROM public.messages),
    'messages_today', (SELECT count(*) FROM public.messages WHERE created_at::date = CURRENT_DATE),
    'total_subscriptions', (SELECT count(*) FROM public.subscriptions WHERE status = 'active'),
    'chat_premium', (SELECT count(*) FROM public.subscriptions WHERE plan_type = 'chat' AND plan = 'premium' AND status = 'active'),
    'edu_starter', (SELECT count(*) FROM public.subscriptions WHERE plan_type = 'edu' AND plan = 'starter' AND status = 'active'),
    'edu_pro', (SELECT count(*) FROM public.subscriptions WHERE plan_type = 'edu' AND plan = 'pro' AND status = 'active'),
    'voice_usage_this_month', (SELECT COALESCE(sum(usage_count), 0) FROM public.voice_usage WHERE month_year = to_char(CURRENT_DATE, 'YYYY-MM'))
  ) INTO result;

  RETURN result;
END;
$$;

-- Admin function: list users with profiles and subscriptions
CREATE OR REPLACE FUNCTION public.admin_list_users(_limit int DEFAULT 50, _offset int DEFAULT 0, _search text DEFAULT '')
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'users', COALESCE((
      SELECT jsonb_agg(row_to_json(u))
      FROM (
        SELECT p.id, p.full_name, p.country, p.state, p.gender, p.created_at, p.onboarding_completed,
               p.preferred_language, p.date_of_birth, p.phone,
               (SELECT jsonb_agg(jsonb_build_object('plan_type', s.plan_type, 'plan', s.plan, 'status', s.status))
                FROM public.subscriptions s WHERE s.user_id = p.id) as subscriptions
        FROM public.profiles p
        WHERE _search = '' OR p.full_name ILIKE '%' || _search || '%'
        ORDER BY p.created_at DESC
        LIMIT _limit OFFSET _offset
      ) u
    ), '[]'::jsonb),
    'total', (SELECT count(*) FROM public.profiles WHERE _search = '' OR full_name ILIKE '%' || _search || '%')
  ) INTO result;

  RETURN result;
END;
$$;

-- Admin function: list subscriptions
CREATE OR REPLACE FUNCTION public.admin_list_subscriptions(_limit int DEFAULT 50, _offset int DEFAULT 0, _plan_type text DEFAULT '', _plan text DEFAULT '')
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'subscriptions', COALESCE((
      SELECT jsonb_agg(row_to_json(s))
      FROM (
        SELECT sub.id, sub.user_id, sub.plan_type, sub.plan, sub.status, sub.created_at, sub.updated_at,
               p.full_name, p.country
        FROM public.subscriptions sub
        LEFT JOIN public.profiles p ON p.id = sub.user_id
        WHERE (_plan_type = '' OR sub.plan_type = _plan_type)
          AND (_plan = '' OR sub.plan = _plan)
        ORDER BY sub.created_at DESC
        LIMIT _limit OFFSET _offset
      ) s
    ), '[]'::jsonb),
    'total', (SELECT count(*) FROM public.subscriptions WHERE (_plan_type = '' OR plan_type = _plan_type) AND (_plan = '' OR plan = _plan))
  ) INTO result;

  RETURN result;
END;
$$;

-- Admin function: conversation stats per user
CREATE OR REPLACE FUNCTION public.admin_list_conversations(_limit int DEFAULT 50, _offset int DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'conversations', COALESCE((
      SELECT jsonb_agg(row_to_json(c))
      FROM (
        SELECT conv.id, conv.title, conv.library_id, conv.created_at, conv.updated_at, conv.user_id,
               p.full_name,
               (SELECT count(*) FROM public.messages m WHERE m.conversation_id = conv.id) as message_count
        FROM public.conversations conv
        LEFT JOIN public.profiles p ON p.id = conv.user_id
        ORDER BY conv.updated_at DESC
        LIMIT _limit OFFSET _offset
      ) c
    ), '[]'::jsonb),
    'total', (SELECT count(*) FROM public.conversations)
  ) INTO result;

  RETURN result;
END;
$$;

-- Admin function: daily message counts for charts
CREATE OR REPLACE FUNCTION public.admin_daily_messages(_days int DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(d))
    FROM (
      SELECT date_trunc('day', created_at)::date as date, count(*) as count
      FROM public.messages
      WHERE created_at >= CURRENT_DATE - _days
      GROUP BY date_trunc('day', created_at)::date
      ORDER BY date
    ) d
  ), '[]'::jsonb);
END;
$$;

-- Admin function: daily signups for charts
CREATE OR REPLACE FUNCTION public.admin_daily_signups(_days int DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(d))
    FROM (
      SELECT created_at::date as date, count(*) as count
      FROM public.profiles
      WHERE created_at >= CURRENT_DATE - _days
      GROUP BY created_at::date
      ORDER BY date
    ) d
  ), '[]'::jsonb);
END;
$$;

-- Admin function: top countries
CREATE OR REPLACE FUNCTION public.admin_top_countries(_limit int DEFAULT 10)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(c))
    FROM (
      SELECT COALESCE(country, 'Unknown') as country, count(*) as count
      FROM public.profiles
      GROUP BY country
      ORDER BY count DESC
      LIMIT _limit
    ) c
  ), '[]'::jsonb);
END;
$$;
