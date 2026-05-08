
-- Capture signup country
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signup_country text;

-- Daily feature usage trend RPC (admin only)
CREATE OR REPLACE FUNCTION public.admin_daily_feature_usage(_days integer DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(d))
    FROM (
      SELECT
        gs.day::date AS date,
        COALESCE(SUM(CASE WHEN fu.feature = 'first_aid' THEN 1 ELSE 0 END), 0) AS first_aid,
        COALESCE(SUM(CASE WHEN fu.feature = 'health_tool' THEN 1 ELSE 0 END), 0) AS health_tool,
        COALESCE(SUM(CASE WHEN fu.feature = 'library' THEN 1 ELSE 0 END), 0) AS library
      FROM generate_series(CURRENT_DATE - (_days - 1), CURRENT_DATE, '1 day'::interval) gs(day)
      LEFT JOIN public.feature_usage fu
        ON fu.created_at::date = gs.day::date
       AND fu.created_at >= CURRENT_DATE - (_days - 1)
      GROUP BY gs.day
      ORDER BY gs.day
    ) d
  ), '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_daily_feature_usage(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_daily_feature_usage(integer) TO authenticated;

-- Engagement export RPC (admin only) - returns rows in a date range filtered by feature
CREATE OR REPLACE FUNCTION public.admin_export_feature_usage(_from timestamptz, _to timestamptz, _feature text DEFAULT '')
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(r))
    FROM (
      SELECT fu.id, fu.feature, fu.item_key, fu.metadata, fu.created_at,
             fu.user_id, p.full_name, p.country, p.signup_country
      FROM public.feature_usage fu
      LEFT JOIN public.profiles p ON p.id = fu.user_id
      WHERE fu.created_at >= _from AND fu.created_at < _to
        AND (_feature = '' OR fu.feature = _feature)
      ORDER BY fu.created_at DESC
    ) r
  ), '[]'::jsonb);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_export_feature_usage(timestamptz, timestamptz, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_export_feature_usage(timestamptz, timestamptz, text) TO authenticated;

-- Users export with date range (admin only)
CREATE OR REPLACE FUNCTION public.admin_export_users(_from timestamptz, _to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(u))
    FROM (
      SELECT p.id, p.full_name, p.country, p.signup_country, p.state, p.gender,
             p.date_of_birth, p.phone, p.preferred_language,
             p.onboarding_completed, p.banned_at, p.created_at
      FROM public.profiles p
      WHERE p.created_at >= _from AND p.created_at < _to
      ORDER BY p.created_at DESC
    ) u
  ), '[]'::jsonb);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_export_users(timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_export_users(timestamptz, timestamptz) TO authenticated;
