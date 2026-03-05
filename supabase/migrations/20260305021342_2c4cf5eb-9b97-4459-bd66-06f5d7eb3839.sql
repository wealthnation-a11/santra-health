
INSERT INTO storage.buckets (id, name, public) VALUES ('lab-uploads', 'lab-uploads', false);

CREATE POLICY "Users can upload lab files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lab-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own lab files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'lab-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own lab files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lab-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
