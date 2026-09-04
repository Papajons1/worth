CREATE OR REPLACE FUNCTION public.get_owner_profile()
RETURNS TABLE (id uuid, display_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.avatar_url
  FROM public.profiles p
  INNER JOIN public.user_roles r ON r.user_id = p.id
  WHERE r.role = 'admin'
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_owner_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_owner_profile() TO authenticated;