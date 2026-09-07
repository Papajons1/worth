ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

CREATE TABLE IF NOT EXISTS public.message_reactions (
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction text NOT NULL CHECK (reaction IN ('heart', 'like', 'laugh')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id, reaction)
);

GRANT SELECT, INSERT, DELETE ON public.message_reactions TO authenticated;
GRANT UPDATE ON public.messages TO authenticated;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants mark messages read" ON public.messages;
CREATE POLICY "Participants mark messages read"
  ON public.messages FOR UPDATE TO authenticated
  USING (fan_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (fan_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Participants read reactions" ON public.message_reactions;
CREATE POLICY "Participants read reactions"
  ON public.message_reactions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
        AND (m.fan_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

DROP POLICY IF EXISTS "Participants add reactions" ON public.message_reactions;
CREATE POLICY "Participants add reactions"
  ON public.message_reactions FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
        AND (m.fan_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

DROP POLICY IF EXISTS "Users remove own reactions" ON public.message_reactions;
CREATE POLICY "Users remove own reactions"
  ON public.message_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;