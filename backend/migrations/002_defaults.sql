-- Default content. Everything here is editable from the admin panel.

INSERT INTO payment_methods (code, enabled, sort_order, label_en, label_ur, instructions_en, instructions_ur) VALUES
  ('payfast', FALSE, 1, 'Card, Bank or Wallet (PayFast)', 'کارڈ، بینک یا والیٹ (PayFast)',
   'You will be taken to PayFast''s secure page to pay by card, bank account or mobile wallet.',
   'آپ کو PayFast کے محفوظ صفحے پر بھیجا جائے گا جہاں آپ کارڈ، بینک اکاؤنٹ یا موبائل والیٹ سے ادائیگی کر سکتے ہیں۔'),
  ('jazzcash', FALSE, 2, 'JazzCash', 'جاز کیش',
   'Pay with your JazzCash mobile account or card on JazzCash''s secure page.',
   'جاز کیش کے محفوظ صفحے پر اپنے موبائل اکاؤنٹ یا کارڈ سے ادائیگی کریں۔'),
  ('easypaisa', FALSE, 3, 'Easypaisa', 'ایزی پیسہ',
   'Pay with your Easypaisa account or card on Easypaisa''s secure page.',
   'ایزی پیسہ کے محفوظ صفحے پر اپنے اکاؤنٹ یا کارڈ سے ادائیگی کریں۔'),
  ('bank', FALSE, 4, 'Bank Transfer', 'بینک ٹرانسفر',
   'Transfer the total to the account below, then upload the receipt. Your download unlocks after we verify it (usually within a few hours).',
   'کل رقم نیچے دیے گئے اکاؤنٹ میں منتقل کریں اور رسید اپ لوڈ کریں۔ تصدیق کے بعد ڈاؤن لوڈ کھل جائے گا (عموماً چند گھنٹوں میں)۔'),
  ('cod', FALSE, 5, 'Pay Later (Cash / Manual)', 'بعد میں ادائیگی (نقد / دستی)',
   'Our team will contact you to collect payment. Your download unlocks once payment is confirmed.',
   'ہماری ٹیم ادائیگی کے لیے آپ سے رابطہ کرے گی۔ ادائیگی کی تصدیق کے بعد ڈاؤن لوڈ کھل جائے گا۔');

INSERT INTO settings (key, value) VALUES
('store', '{
  "name": {"en": "Chand Designer", "ur": "چاند ڈیزائنر"},
  "tagline": {"en": "Machine embroidery designs, ready to stitch", "ur": "مشین ایمبرائیڈری ڈیزائن، سلائی کے لیے تیار"},
  "email": "", "phone": "", "whatsapp": "", "address": {"en": "2381-F, Shop No. 12, Chuna Mandi, Lahore", "ur": "2381-F، دکان نمبر 12، چونا منڈی، لاہور"},
  "logo": "", "social": {"facebook": "", "instagram": "", "youtube": "", "tiktok": ""},
  "downloadLimit": 10, "accessDays": 30
}'),
('home', '{
  "heading": {"en": "Embroidery designs that stitch perfectly", "ur": "ایسے ایمبرائیڈری ڈیزائن جو بہترین سلیں"},
  "text": {"en": "Professionally digitized files for every machine. Pay securely and download your ZIP instantly.", "ur": "ہر مشین کے لیے پروفیشنل ڈیجیٹائزڈ فائلیں۔ محفوظ ادائیگی کریں اور فوراً اپنی ZIP فائل ڈاؤن لوڈ کریں۔"},
  "primaryCta": {"en": "Browse categories", "ur": "کیٹیگریز دیکھیں"},
  "secondaryCta": {"en": "New arrivals", "ur": "نئے ڈیزائن"},
  "showNewArrivals": true, "showSale": true, "showHowItWorks": true, "showFormats": true, "showFaq": true
}'),
('announcement', '{
  "enabled": true,
  "items": [
    {"en": "Instant ZIP download after payment", "ur": "ادائیگی کے فوراً بعد ZIP ڈاؤن لوڈ"},
    {"en": "DST · PES · JEF · EXP · VP3 formats", "ur": "DST · PES · JEF · EXP · VP3 فارمیٹس"},
    {"en": "Pay with JazzCash, Easypaisa or bank", "ur": "جاز کیش، ایزی پیسہ یا بینک سے ادائیگی"}
  ]
}'),
('faq', '{
  "items": [
    {"q": {"en": "How do I get my design after payment?", "ur": "ادائیگی کے بعد ڈیزائن کیسے ملے گا؟"},
     "a": {"en": "As soon as your payment is confirmed, the order page shows a Download button for each design, and we email you a link. Each file is a ZIP with all formats.", "ur": "ادائیگی کی تصدیق ہوتے ہی آرڈر صفحے پر ہر ڈیزائن کا ڈاؤن لوڈ بٹن آ جاتا ہے اور ہم آپ کو ای میل پر لنک بھیجتے ہیں۔ ہر فائل ZIP میں تمام فارمیٹس کے ساتھ ہوتی ہے۔"}},
    {"q": {"en": "Which embroidery machines are supported?", "ur": "کون سی ایمبرائیڈری مشینیں سپورٹ ہیں؟"},
     "a": {"en": "Every ZIP includes common formats such as DST (Tajima), PES (Brother), JEF (Janome), EXP (Melco/Bernina) and VP3 (Husqvarna). Check the formats listed on each design.", "ur": "ہر ZIP میں عام فارمیٹس ہوتے ہیں جیسے DST (تاجیما)، PES (برادر)، JEF (جانومے)، EXP (میلکو/برنینا) اور VP3 (ہسکوارنا)۔ ہر ڈیزائن پر درج فارمیٹس دیکھیں۔"}},
    {"q": {"en": "Do I need an account to buy?", "ur": "کیا خریدنے کے لیے اکاؤنٹ ضروری ہے؟"},
     "a": {"en": "No. You only enter your name, email and phone at checkout.", "ur": "نہیں۔ چیک آؤٹ پر صرف نام، ای میل اور فون نمبر درکار ہے۔"}},
    {"q": {"en": "I lost my download link. What now?", "ur": "میرا ڈاؤن لوڈ لنک گم ہو گیا، اب کیا کروں؟"},
     "a": {"en": "Open Track Order, enter your order number and email, and we will send a fresh link to your inbox.", "ur": "ٹریک آرڈر کھولیں، آرڈر نمبر اور ای میل درج کریں، ہم آپ کو نیا لنک بھیج دیں گے۔"}},
    {"q": {"en": "Can I get a refund?", "ur": "کیا رقم واپس مل سکتی ہے؟"},
     "a": {"en": "Because designs are digital files, refunds are given only if a file is faulty and we cannot fix it. See our refund policy.", "ur": "چونکہ ڈیزائن ڈیجیٹل فائلیں ہیں، رقم صرف اس صورت میں واپس ہوتی ہے جب فائل خراب ہو اور ہم اسے ٹھیک نہ کر سکیں۔ ریفنڈ پالیسی دیکھیں۔"}}
  ]
}'),
('seo', '{
  "titleSuffix": "Chand Designer",
  "description": {"en": "Buy professionally digitized machine embroidery designs in DST, PES, JEF and more. Secure payment in PKR and instant ZIP download.", "ur": "DST، PES، JEF اور مزید فارمیٹس میں پروفیشنل مشین ایمبرائیڈری ڈیزائن خریدیں۔ پاکستانی روپے میں محفوظ ادائیگی اور فوری ZIP ڈاؤن لوڈ۔"}
}'),
('smtp', '{"host": "", "port": 587, "secure": false, "user": "", "from": "", "passEnc": ""}');

INSERT INTO pages (slug, title_en, title_ur, body_en, body_ur, seo_description_en, seo_description_ur) VALUES
('about', 'About us', 'ہمارے بارے میں',
 E'We are a Lahore-based embroidery studio creating machine-ready designs for tailors, boutiques and home embroiderers.\n\n## What we make\n- Neckline, gala daman and border designs\n- Shawl, sherwani and bridal motifs\n- Logos and custom digitizing\n\nEvery design is test-stitched before it goes on sale.',
 E'ہم لاہور میں قائم ایمبرائیڈری اسٹوڈیو ہیں جو درزیوں، بوتیکس اور گھریلو صارفین کے لیے مشین کے لیے تیار ڈیزائن بناتے ہیں۔\n\n## ہم کیا بناتے ہیں\n- گلا، گلا دامن اور بارڈر ڈیزائن\n- شال، شیروانی اور برائیڈل موٹیفس\n- لوگو اور کسٹم ڈیجیٹائزنگ\n\nہر ڈیزائن فروخت سے پہلے ٹیسٹ سلائی کیا جاتا ہے۔',
 'Lahore-based studio making test-stitched machine embroidery designs.', 'لاہور کا اسٹوڈیو جو ٹیسٹ شدہ مشین ایمبرائیڈری ڈیزائن بناتا ہے۔'),
('privacy-policy', 'Privacy policy', 'پرائیویسی پالیسی',
 E'We collect only your name, email and phone to process orders and send download links.\n\n## How we use your data\n- To deliver your files and order emails\n- To answer support requests\n\nWe never sell your data. Payments are handled by the payment provider; we do not store card or wallet details.',
 E'ہم آرڈر مکمل کرنے اور ڈاؤن لوڈ لنک بھیجنے کے لیے صرف آپ کا نام، ای میل اور فون نمبر لیتے ہیں۔\n\n## ہم ڈیٹا کیسے استعمال کرتے ہیں\n- فائلیں اور آرڈر ای میلز بھیجنے کے لیے\n- سپورٹ کے سوالات کا جواب دینے کے لیے\n\nہم آپ کا ڈیٹا کبھی فروخت نہیں کرتے۔ ادائیگی پیمنٹ پرووائیڈر کرتا ہے، ہم کارڈ یا والیٹ کی تفصیلات محفوظ نہیں کرتے۔',
 'How we collect and protect your data.', 'ہم آپ کا ڈیٹا کیسے جمع اور محفوظ کرتے ہیں۔'),
('refund-policy', 'Refund policy', 'ریفنڈ پالیسی',
 E'Designs are digital downloads, so all sales are final once a file has been downloaded.\n\n## When we refund\n- The file is corrupted or will not open, and we cannot send a working copy within 48 hours\n- You were charged twice for the same order\n\nContact us with your order number to request help.',
 E'ڈیزائن ڈیجیٹل ڈاؤن لوڈ ہیں، اس لیے فائل ڈاؤن لوڈ ہونے کے بعد خریداری حتمی ہے۔\n\n## ریفنڈ کب ملے گا\n- فائل خراب ہو یا نہ کھلے، اور ہم 48 گھنٹوں میں درست فائل نہ بھیج سکیں\n- ایک ہی آرڈر کی رقم دو بار کٹ گئی ہو\n\nمدد کے لیے اپنے آرڈر نمبر کے ساتھ ہم سے رابطہ کریں۔',
 'When digital design purchases can be refunded.', 'ڈیجیٹل ڈیزائن کی خریداری پر ریفنڈ کب ملتا ہے۔'),
('terms', 'Terms of service', 'شرائط و ضوابط',
 E'By buying a design you get a licence to stitch it on products you make and sell. You may not resell, share or upload the design files themselves.\n\nPrices are in Pakistani Rupees (PKR). We may update these terms; the version on this page applies to new orders.',
 E'ڈیزائن خرید کر آپ کو اسے اپنی بنائی اور بیچی جانے والی اشیاء پر سلائی کرنے کا لائسنس ملتا ہے۔ آپ ڈیزائن فائلیں خود دوبارہ فروخت، شیئر یا اپ لوڈ نہیں کر سکتے۔\n\nقیمتیں پاکستانی روپے میں ہیں۔ ہم یہ شرائط تبدیل کر سکتے ہیں؛ نئے آرڈرز پر اس صفحے کا ورژن لاگو ہوگا۔',
 'Licence and purchase terms for embroidery design files.', 'ایمبرائیڈری ڈیزائن فائلوں کی خریداری اور لائسنس کی شرائط۔'),
('delivery-policy', 'Digital delivery', 'ڈیجیٹل ڈیلیوری',
 E'There is no physical shipping. After payment is confirmed you can download your ZIP files from the order page and from the link in your email.\n\nDownload links are valid for 30 days and can be renewed from Track Order.',
 E'کوئی فزیکل شپنگ نہیں ہے۔ ادائیگی کی تصدیق کے بعد آپ آرڈر صفحے اور ای میل لنک سے اپنی ZIP فائلیں ڈاؤن لوڈ کر سکتے ہیں۔\n\nڈاؤن لوڈ لنک 30 دن کے لیے کارآمد ہیں اور ٹریک آرڈر سے دوبارہ حاصل کیے جا سکتے ہیں۔',
 'How digital embroidery files are delivered.', 'ڈیجیٹل ایمبرائیڈری فائلیں کیسے فراہم کی جاتی ہیں۔');
