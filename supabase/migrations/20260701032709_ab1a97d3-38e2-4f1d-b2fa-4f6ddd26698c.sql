CREATE OR REPLACE FUNCTION public.admin_user_detail(_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  SELECT jsonb_build_object(
    'profile', (SELECT row_to_json(p) FROM public.profiles p WHERE p.id = _user_id),
    'email', (SELECT email FROM auth.users WHERE id = _user_id),
    'health_profile', (SELECT row_to_json(h) FROM public.health_profiles h WHERE h.user_id = _user_id),
    'roles', COALESCE((SELECT jsonb_agg(role) FROM public.user_roles WHERE user_id = _user_id), '[]'::jsonb),
    'subscriptions', COALESCE((SELECT jsonb_agg(row_to_json(s)) FROM public.subscriptions s WHERE s.user_id = _user_id), '[]'::jsonb),
    'voice_usage_this_month', COALESCE((SELECT usage_count FROM public.voice_usage WHERE user_id = _user_id AND month_year = to_char(CURRENT_DATE,'YYYY-MM')), 0),
    'messages_total', (SELECT count(*) FROM public.messages m JOIN public.conversations c ON c.id = m.conversation_id WHERE c.user_id = _user_id),
    'conversations_total', (SELECT count(*) FROM public.conversations WHERE user_id = _user_id),
    'recent_conversations', COALESCE((SELECT jsonb_agg(row_to_json(c)) FROM (
      SELECT id, title, library_id, updated_at,
        (SELECT count(*) FROM public.messages m WHERE m.conversation_id = c.id) AS message_count
      FROM public.conversations c WHERE c.user_id = _user_id
      ORDER BY updated_at DESC LIMIT 10
    ) c), '[]'::jsonb),
    'recent_activity', COALESCE((SELECT jsonb_agg(row_to_json(a)) FROM (
      SELECT feature, item_key, metadata, created_at
      FROM public.feature_usage WHERE user_id = _user_id
      ORDER BY created_at DESC LIMIT 25
    ) a), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_users_v2(
  _limit integer DEFAULT 25,
  _offset integer DEFAULT 0,
  _search text DEFAULT '',
  _country text DEFAULT '',
  _plan text DEFAULT '',
  _status text DEFAULT '',
  _sort text DEFAULT 'created_at',
  _sort_dir text DEFAULT 'desc'
) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb; q text; dir text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  dir := CASE WHEN lower(_sort_dir) = 'asc' THEN 'asc' ELSE 'desc' END;
  q := format($q$
    WITH filtered AS (
      SELECT p.* FROM public.profiles p
      WHERE (%L = '' OR p.full_name ILIKE '%%' || %L || '%%')
        AND (%L = '' OR p.country = %L OR p.signup_country = %L)
        AND (%L = '' OR (
              %L = 'banned' AND p.banned_at IS NOT NULL
           OR %L = 'active' AND p.banned_at IS NULL
           OR %L = 'onboarded' AND p.onboarding_completed = true
           OR %L = 'not_onboarded' AND p.onboarding_completed = false
        ))
        AND (%L = '' OR EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id AND s.plan = %L AND s.status = 'active'))
    )
    SELECT jsonb_build_object(
      'users', COALESCE((SELECT jsonb_agg(row_to_json(u)) FROM (
        SELECT f.id, f.full_name, f.country, f.signup_country, f.state, f.gender, f.created_at,
               f.onboarding_completed, f.banned_at, f.ban_reason, f.preferred_language,
               f.daily_message_limit_override, f.monthly_voice_limit_override,
               (SELECT email FROM auth.users WHERE id = f.id) AS email,
               (SELECT jsonb_agg(jsonb_build_object('plan_type', s.plan_type, 'plan', s.plan, 'status', s.status))
                FROM public.subscriptions s WHERE s.user_id = f.id) AS subscriptions
        FROM filtered f ORDER BY f.%I %s NULLS LAST LIMIT %s OFFSET %s
      ) u), '[]'::jsonb),
      'total', (SELECT count(*) FROM filtered)
    )
  $q$,
    _search, _search,
    _country, _country, _country,
    _status, _status, _status, _status, _status,
    _plan, _plan,
    _sort, dir, _limit, _offset
  );
  EXECUTE q INTO result;
  RETURN result;
END $$;

REVOKE ALL ON FUNCTION public.admin_user_detail(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_users_v2(integer,integer,text,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_user_detail(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users_v2(integer,integer,text,text,text,text,text,text) TO authenticated;