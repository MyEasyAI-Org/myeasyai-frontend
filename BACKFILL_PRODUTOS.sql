-- =====================================================
-- BACKFILL: Adicionar produtos para usuários existentes
-- =====================================================
-- Execute este SQL no Supabase SQL Editor para dar produtos
-- aos usuários que foram criados antes dos triggers

-- Adicionar MyEasyWebsite para usuários que não têm
INSERT INTO public.user_products (
  user_uuid,
  product_name,
  product_status,
  subscribed_at,
  sites_created,
  consultations_made
)
SELECT
  u.uuid,
  'MyEasyWebsite' as product_name,
  'active' as product_status,
  NOW() as subscribed_at,
  0 as sites_created,
  0 as consultations_made
FROM public.users u
LEFT JOIN public.user_products up ON u.uuid = up.user_uuid AND up.product_name = 'MyEasyWebsite'
WHERE up.user_uuid IS NULL;

-- Adicionar BusinessGuru para usuários que não têm
INSERT INTO public.user_products (
  user_uuid,
  product_name,
  product_status,
  subscribed_at,
  sites_created,
  consultations_made
)
SELECT
  u.uuid,
  'BusinessGuru' as product_name,
  'active' as product_status,
  NOW() as subscribed_at,
  0 as sites_created,
  0 as consultations_made
FROM public.users u
LEFT JOIN public.user_products up ON u.uuid = up.user_uuid AND up.product_name = 'BusinessGuru'
WHERE up.user_uuid IS NULL;

-- Verificar resultado
SELECT
  u.email,
  up.product_name,
  up.product_status,
  up.subscribed_at
FROM public.users u
LEFT JOIN public.user_products up ON u.uuid = up.user_uuid
ORDER BY u.email, up.product_name;
