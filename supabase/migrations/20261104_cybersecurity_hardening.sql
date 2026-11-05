-- ==============================================================================
-- MY NYSC COMPANION: CYBERSECURITY HARDENING & RLS FORTIFICATION MIGRATION
-- Compliant with OWASP Top 10, IDOR Prevention, Non-Recursive RLS Architecture
-- ==============================================================================

-- 1. SECURITY DEFINER HELPER FUNCTION
-- Prevents recursive RLS query loops by decoupling role lookup from table policies.
-- 'SET search_path = public' mitigates search_path injection vulnerabilities.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_admin = true
    ),
    false
  );
$$;

-- 2. TABLE LEVEL SECURITY & IDOR HARDENING
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- Non-recursive: Avoids self-referencing subqueries on profiles within the policy.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_directory_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Owner can read their full profile (including private contact data)
CREATE POLICY "profiles_self_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Directory visibility: Corps members can discover peers ONLY if is_directory_visible = true
CREATE POLICY "profiles_directory_select"
  ON public.profiles
  FOR SELECT
  TO authenticated, anon
  USING (is_directory_visible = true);

-- Owner can only insert their own profile
CREATE POLICY "profiles_self_insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Owner can only update their own profile (IDOR protection)
CREATE POLICY "profiles_self_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin full access via non-recursive security definer function
CREATE POLICY "profiles_admin_all"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- USER FEEDBACK POLICIES
-- Strict IDOR prevention: Corps members only manage their own feedback tickets.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "feedback_user_insert" ON public.user_feedback;
DROP POLICY IF EXISTS "feedback_user_select" ON public.user_feedback;
DROP POLICY IF EXISTS "feedback_admin_manage" ON public.user_feedback;

-- Users can submit feedback attributed to their authenticated identity
CREATE POLICY "feedback_user_insert"
  ON public.user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can inspect their own submitted tickets
CREATE POLICY "feedback_user_select"
  ON public.user_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Directorate admins have full triage / resolution rights
CREATE POLICY "feedback_admin_manage"
  ON public.user_feedback
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- MARKETPLACE ITEMS POLICIES
-- Public marketplace discovery with seller-only mutation controls
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "marketplace_public_read" ON public.marketplace_items;
DROP POLICY IF EXISTS "marketplace_seller_insert" ON public.marketplace_items;
DROP POLICY IF EXISTS "marketplace_seller_update" ON public.marketplace_items;
DROP POLICY IF EXISTS "marketplace_seller_delete" ON public.marketplace_items;
DROP POLICY IF EXISTS "marketplace_admin_manage" ON public.marketplace_items;

-- Active listings are visible to all corps members
CREATE POLICY "marketplace_public_read"
  ON public.marketplace_items
  FOR SELECT
  TO authenticated, anon
  USING (is_sold = false OR auth.uid() = seller_id OR public.is_admin());

-- Sellers can only list items under their own authenticated account
CREATE POLICY "marketplace_seller_insert"
  ON public.marketplace_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can only update or mark sold their own listings
CREATE POLICY "marketplace_seller_update"
  ON public.marketplace_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can delete their own listings
CREATE POLICY "marketplace_seller_delete"
  ON public.marketplace_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Admins can moderate / remove illicit listings
CREATE POLICY "marketplace_admin_manage"
  ON public.marketplace_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- DOCUMENTS / DOCUMENT VAULT POLICIES
-- Zero-trust locker: STRICT isolation to owner only
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "documents_owner_select" ON public.documents;
DROP POLICY IF EXISTS "documents_owner_insert" ON public.documents;
DROP POLICY IF EXISTS "documents_owner_update" ON public.documents;
DROP POLICY IF EXISTS "documents_owner_delete" ON public.documents;

CREATE POLICY "documents_owner_select"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "documents_owner_insert"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_owner_update"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_owner_delete"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. STORAGE BUCKET LOCKDOWNS & HARDENING
-- Storage policies enforcing owner isolation and MIME / Size restrictions
-- ------------------------------------------------------------------------------

-- Ensure secure buckets exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('document_vault', 'document_vault', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('marketplace', 'marketplace', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('saed_notes', 'saed_notes', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = 5242880,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Document Vault (Private, strictly owner-only by folder path)
DROP POLICY IF EXISTS "vault_owner_read" ON storage.objects;
DROP POLICY IF EXISTS "vault_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "vault_owner_delete" ON storage.objects;

CREATE POLICY "vault_owner_read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'document_vault'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "vault_owner_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'document_vault'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND octet_length(COALESCE(metadata->>'size', '0')) <= 5242880
  );

CREATE POLICY "vault_owner_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'document_vault'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS: Marketplace & SAED Photos (Strict mime types and 5MB limit)
DROP POLICY IF EXISTS "images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "images_owner_delete" ON storage.objects;

CREATE POLICY "images_public_read"
  ON storage.objects
  FOR SELECT
  TO authenticated, anon
  USING (bucket_id IN ('marketplace', 'saed_notes'));

CREATE POLICY "images_authenticated_upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('marketplace', 'saed_notes')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "images_owner_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('marketplace', 'saed_notes')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
