ALTER TABLE products
  ADD COLUMN package_path TEXT,
  ADD COLUMN package_file_name TEXT;

ALTER TABLE order_lines
  ADD COLUMN package_path TEXT,
  ADD COLUMN package_file_name TEXT;
