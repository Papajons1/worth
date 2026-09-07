CREATE TABLE IF NOT EXISTS public.owner_banner (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  message text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.owner_banner ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.owner_banner TO authenticated;
GRANT ALL ON public.owner_banner TO service_role;

DROP POLICY IF EXISTS "Authenticated users read owner banner" ON public.owner_banner;
CREATE POLICY "Authenticated users read owner banner"
  ON public.owner_banner FOR SELECT TO authenticated USING (true);

DROP FUNCTION IF EXISTS public.clear_fan_messages(uuid);
CREATE OR REPLACE FUNCTION public.clear_fan_messages(p_fan_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  DELETE FROM public.messages WHERE fan_id = p_fan_id;
  RETURN true;
END;
$$;

DROP FUNCTION IF EXISTS public.remove_fan(uuid);
CREATE OR REPLACE FUNCTION public.remove_fan(p_fan_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  DELETE FROM auth.users WHERE id = p_fan_id;
  RETURN true;
END;
$$;

DROP FUNCTION IF EXISTS public.set_owner_banner(text);
CREATE OR REPLACE FUNCTION public.set_owner_banner(p_message text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  INSERT INTO public.owner_banner (id, message, updated_at)
  VALUES (true, left(coalesce(p_message, ''), 500), now())
  ON CONFLICT (id) DO UPDATE SET message = excluded.message, updated_at = now();
  RETURN true;
END;
$$;

DROP FUNCTION IF EXISTS public.get_owner_profile();
CREATE OR REPLACE FUNCTION public.get_owner_profile()
RETURNS TABLE (id uuid, display_name text, avatar_url text, banner_message text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.avatar_url, coalesce(b.message, '')
  FROM public.profiles p
  INNER JOIN public.user_roles r ON r.user_id = p.id
  LEFT JOIN public.owner_banner b ON b.id = true
  WHERE r.role = 'admin'
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.clear_fan_messages(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_fan(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_owner_banner(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_owner_profile() TO authenticated;