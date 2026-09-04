-- Replace the placeholder below before running this migration in Supabase.
CREATE TABLE IF NOT EXISTS public.owner_claim_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  claim_code text NOT NULL
);

INSERT INTO public.owner_claim_config (id, claim_code)
VALUES (true, 'GENE-2026-1973-FAN-CHAT')
ON CONFLICT (id) DO NOTHING;

REVOKE ALL ON TABLE public.owner_claim_config FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.claim_owner_role();

CREATE OR REPLACE FUNCTION public.claim_owner_role(p_claim_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  configured_code text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT claim_code INTO configured_code
  FROM public.owner_claim_config
  WHERE id = true
  FOR UPDATE;

  IF configured_code IS NULL OR p_claim_code IS DISTINCT FROM configured_code THEN
    RAISE EXCEPTION 'Invalid owner claim code';
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_owner_role(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_owner_role(text) TO authenticated;