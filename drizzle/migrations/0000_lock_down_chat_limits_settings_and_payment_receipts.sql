CREATE TABLE public.subscription_payment_receipts (
  reference text PRIMARY KEY,
  user_id uuid NOT NULL,
  plan_type text NOT NULL,
  plan text NOT NULL,
  amount bigint NOT NULL,
  currency text NOT NULL,
  paid_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.subscription_payment_receipts TO service_role;
ALTER TABLE public.subscription_payment_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own daily usage" ON public.daily_message_usage;
DROP POLICY IF EXISTS "Users can update their own daily usage" ON public.daily_message_usage;
REVOKE INSERT, UPDATE, DELETE ON public.daily_message_usage FROM anon, authenticated;
GRANT SELECT ON public.daily_message_usage TO authenticated;
GRANT ALL ON public.daily_message_usage TO service_role;

CREATE OR REPLACE FUNCTION public.consume_daily_message()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_limit integer;
  v_count integer;
  v_is_premium boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = v_user_id AND plan_type = 'chat'
      AND plan = 'premium' AND status = 'active'
  ) INTO v_is_premium;

  IF v_is_premium THEN
    RETURN true;
  END IF;

  SELECT COALESCE(
    (SELECT daily_message_limit_override FROM public.profiles WHERE id = v_user_id),
    (SELECT NULLIF(value->>'free_daily_messages', '')::integer
       FROM public.app_settings WHERE key = 'limits'),
    15
  ) INTO v_limit;
  v_limit := GREATEST(0, LEAST(COALESCE(v_limit, 15), 10000));

  INSERT INTO public.daily_message_usage (user_id, usage_date, message_count)
  VALUES (v_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET message_count = public.daily_message_usage.message_count + 1,
                updated_at = now()
  WHERE public.daily_message_usage.message_count < v_limit
  RETURNING message_count INTO v_count;

  RETURN FOUND;
END;
$function$;
REVOKE ALL ON FUNCTION public.consume_daily_message() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_daily_message() TO authenticated;

DROP POLICY IF EXISTS "Authenticated can read app settings" ON public.app_settings;
CREATE POLICY "Authenticated can read public app settings"
  ON public.app_settings FOR SELECT TO authenticated
  USING (key IN ('broadcast_banner', 'maintenance_mode', 'feature_flags', 'limits'));

REVOKE ALL ON FUNCTION public.admin_create_lab_api_key(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_lab_api_key(text, integer) TO service_role;