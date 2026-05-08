
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
        COALESCE(SUM(CASE WHEN fu.feature LIKE 'first_aid%' THEN 1 ELSE 0 END), 0) AS first_aid,
        COALESCE(SUM(CASE WHEN fu.feature LIKE 'health_tool%' THEN 1 ELSE 0 END), 0) AS health_tool,
        COALESCE(SUM(CASE WHEN fu.feature LIKE 'library%' THEN 1 ELSE 0 END), 0) AS library
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
