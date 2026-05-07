-- Restrict EXECUTE on admin SECURITY DEFINER functions to authenticated role only
REVOKE EXECUTE ON FUNCTION public.admin_get_stats() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_users(integer, integer, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_conversations(integer, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_subscriptions(integer, integer, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_audit_log(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_setting(text, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_ban_user(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_unban_user(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_grant_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_subscription(uuid, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_delete_conversation(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_daily_signups(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_daily_messages(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_top_countries(integer) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_get_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users(integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_conversations(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_subscriptions(integer, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_audit_log(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_setting(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_ban_user(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_unban_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_subscription(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_conversation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_daily_signups(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_daily_messages(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_top_countries(integer) TO authenticated;

-- Seed default feature_flags so the admin toggles UI shows controls
INSERT INTO public.app_settings (key, value)
VALUES ('feature_flags', '{"voice_input": true, "lab_interpreter": true, "google_signin": true, "edu_libraries": true, "health_tools": true}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = public.app_settings.value || EXCLUDED.value;

INSERT INTO public.app_settings (key, value)
VALUES ('limits', '{"free_daily_messages": 15, "free_monthly_voice": 10}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.app_settings (key, value)
VALUES ('broadcast_banner', '{"enabled": false, "message": "", "variant": "info"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.app_settings (key, value)
VALUES ('maintenance_mode', '{"enabled": false, "message": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;