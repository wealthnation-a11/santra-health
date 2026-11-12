REVOKE ALL ON TABLE public.app_settings FROM anon, authenticated;
GRANT SELECT ON TABLE public.app_settings TO authenticated;
GRANT ALL ON TABLE public.app_settings TO service_role;
REVOKE ALL ON TABLE public.daily_message_usage FROM anon, authenticated;
GRANT SELECT ON TABLE public.daily_message_usage TO authenticated;
GRANT ALL ON TABLE public.daily_message_usage TO service_role;