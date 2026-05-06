INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'bonaventurejoshuaaugustine@gmail.com'
ON CONFLICT DO NOTHING;