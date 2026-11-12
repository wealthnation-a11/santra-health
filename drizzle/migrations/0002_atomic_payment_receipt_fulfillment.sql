CREATE OR REPLACE FUNCTION public.fulfill_verified_payment(
  p_reference text,
  p_user_id uuid,
  p_plan_type text,
  p_plan text,
  p_amount bigint,
  p_currency text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF p_reference IS NULL OR length(p_reference) < 1 OR length(p_reference) > 128
     OR p_plan_type NOT IN ('chat', 'edu')
     OR p_plan NOT IN ('premium', 'edu_starter', 'edu_pro')
     OR (p_plan_type = 'chat' AND p_plan <> 'premium')
     OR (p_plan_type = 'edu' AND p_plan = 'premium')
     OR p_amount <= 0 OR p_currency !~ '^[A-Z]{3}$' THEN
    RAISE EXCEPTION 'Invalid payment fulfillment';
  END IF;

  INSERT INTO public.subscription_payment_receipts (reference, user_id, plan_type, plan, amount, currency)
  VALUES (p_reference, p_user_id, p_plan_type, p_plan, p_amount, p_currency)
  ON CONFLICT (reference) DO NOTHING;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.subscriptions (user_id, plan, plan_type, status, updated_at)
  VALUES (p_user_id, p_plan, p_plan_type, 'active', now())
  ON CONFLICT (user_id) DO UPDATE
    SET plan = EXCLUDED.plan,
        plan_type = EXCLUDED.plan_type,
        status = EXCLUDED.status,
        updated_at = now();

  RETURN true;
END;
$function$;
REVOKE ALL ON FUNCTION public.fulfill_verified_payment(text, uuid, text, text, bigint, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_verified_payment(text, uuid, text, text, bigint, text) TO service_role;

DROP POLICY IF EXISTS "Authenticated can read public app settings" ON public.app_settings;
CREATE POLICY "Public can read allowlisted app settings"
  ON public.app_settings FOR SELECT TO anon, authenticated
  USING (key IN ('broadcast_banner', 'maintenance_mode', 'feature_flags', 'limits'));
GRANT SELECT ON TABLE public.app_settings TO anon, authenticated;
GRANT ALL ON TABLE public.app_settings TO service_role;