-- Update live storefront address (Footer, Contact, SEO).
UPDATE settings
SET value = jsonb_set(
  jsonb_set(value, '{address,en}', '"2381-F, Shop No. 12, Chuna Mandi, Lahore"'::jsonb),
  '{address,ur}', '"2381-F، دکان نمبر 12، چونا منڈی، لاہور"'::jsonb
)
WHERE key = 'store';
