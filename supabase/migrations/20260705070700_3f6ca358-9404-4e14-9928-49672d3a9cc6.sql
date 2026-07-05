
-- Restrict app_settings SELECT to authenticated users only
DROP POLICY IF EXISTS "Public can read app settings" ON public.app_settings;
CREATE POLICY "Authenticated can read app settings"
  ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Restrict edu_pro_waitlist INSERT to authenticated users (was open to public with true)
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.edu_pro_waitlist;
CREATE POLICY "Authenticated can join waitlist"
  ON public.edu_pro_waitlist
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
