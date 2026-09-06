ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_type text,
  ADD COLUMN IF NOT EXISTS attachment_name text;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('chat-media', 'chat-media', false, 104857600)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 104857600;

DROP POLICY IF EXISTS "Chat users upload media" ON storage.objects;
CREATE POLICY "Chat users upload media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "Chat users read media" ON storage.objects;
CREATE POLICY "Chat users read media"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-media'
  AND EXISTS (
    SELECT 1
    FROM public.messages m
    WHERE m.attachment_url = name
      AND (
        m.fan_id = auth.uid()
        OR m.sender_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
      )
  )
);