-- Feature usage tracking
CREATE TABLE IF NOT EXISTS public.feature_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL, -- 'first_aid' | 'health_tool' | 'library'
  item_key text,         -- e.g. topic id, tool name (bmi/water/calorie), library id
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user ON public.feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON public.feature_usage(feature);
CREATE INDEX IF NOT EXISTS idx_feature_usage_created ON public.feature_usage(created_at DESC);

ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own usage" ON public.feature_usage
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON public.feature_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage" ON public.feature_usage
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Aggregate stats RPC for admins
CREATE OR REPLACE FUNCTION public.admin_feature_usage_stats(_days integer DEFAULT 30, _limit integer DEFAULT 100)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'totals', COALESCE((
      SELECT jsonb_object_agg(feature, count)
      FROM (
        SELECT feature, count(*) as count
        FROM public.feature_usage
        WHERE created_at >= now() - (_days || ' days')::interval
        GROUP BY feature
      ) t
    ), '{}'::jsonb),
    'by_item', COALESCE((
      SELECT jsonb_agg(row_to_json(i))
      FROM (
        SELECT feature, item_key, count(*) as count
        FROM public.feature_usage
        WHERE created_at >= now() - (_days || ' days')::interval
          AND item_key IS NOT NULL
        GROUP BY feature, item_key
        ORDER BY count DESC
        LIMIT 50
      ) i
    ), '[]'::jsonb),
    'recent', COALESCE((
      SELECT jsonb_agg(row_to_json(r))
      FROM (
        SELECT fu.id, fu.feature, fu.item_key, fu.metadata, fu.created_at,
               p.full_name, p.country
        FROM public.feature_usage fu
        LEFT JOIN public.profiles p ON p.id = fu.user_id
        ORDER BY fu.created_at DESC
        LIMIT _limit
      ) r
    ), '[]'::jsonb),
    'library_conversations', COALESCE((
      SELECT jsonb_agg(row_to_json(l))
      FROM (
        SELECT library_id, count(*) as count
        FROM public.conversations
        WHERE library_id IS NOT NULL
          AND updated_at >= now() - (_days || ' days')::interval
        GROUP BY library_id
        ORDER BY count DESC
      ) l
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_feature_usage_stats(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_feature_usage_stats(integer, integer) TO authenticated;