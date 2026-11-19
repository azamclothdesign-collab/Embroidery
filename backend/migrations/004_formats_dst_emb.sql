-- Store sells DST + EMB only; normalize existing product format labels.
UPDATE products
SET formats = ARRAY['DST', 'EMB']::text[];

-- Refresh seed-style marketing copy on live installs (idempotent for new wording).
UPDATE settings
SET value = jsonb_set(
  value,
  '{items}',
  (
    SELECT COALESCE(jsonb_agg(
      CASE
        WHEN item->>'en' LIKE '%PES%' OR item->>'en' LIKE '%JEF%' OR item->>'en' LIKE '%EXP%' OR item->>'en' LIKE '%VP3%'
          THEN '{"en":"DST · EMB formats","ur":"DST · EMB فارمیٹس"}'::jsonb
        ELSE item
      END
    ), '[]'::jsonb)
    FROM jsonb_array_elements(value->'items') AS item
  )
)
WHERE key = 'announcement';

UPDATE settings
SET value = jsonb_set(
  value,
  '{items}',
  (
    SELECT COALESCE(jsonb_agg(
      CASE
        WHEN item#>>'{q,en}' = 'Which embroidery machines are supported?'
          THEN jsonb_set(
            item,
            '{a}',
            '{"en":"Every ZIP includes DST (Tajima / commercial machines) and EMB (Wilcom / design software). Check the formats listed on each design.","ur":"ہر ZIP میں DST (تاجیما / کمرشل مشینیں) اور EMB (ولکم / ڈیزائن سافٹ ویئر) شامل ہیں۔ ہر ڈیزائن پر درج فارمیٹس دیکھیں۔"}'::jsonb
          )
        ELSE item
      END
    ), '[]'::jsonb)
    FROM jsonb_array_elements(value->'items') AS item
  )
)
WHERE key = 'faq';

UPDATE settings
SET value = jsonb_set(
  value,
  '{description}',
  '{"en":"Buy professionally digitized machine embroidery designs in DST and EMB. Secure payment in PKR and instant ZIP download.","ur":"DST اور EMB فارمیٹس میں پروفیشنل مشین ایمبرائیڈری ڈیزائن خریدیں۔ پاکستانی روپے میں محفوظ ادائیگی اور فوری ZIP ڈاؤن لوڈ۔"}'::jsonb
)
WHERE key = 'seo';
