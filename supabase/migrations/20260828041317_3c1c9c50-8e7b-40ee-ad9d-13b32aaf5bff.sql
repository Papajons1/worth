REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_owner_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owner_exists() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_owner_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.owner_exists() TO anon, authenticated;