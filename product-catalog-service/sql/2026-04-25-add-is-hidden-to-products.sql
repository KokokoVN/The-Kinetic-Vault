ALTER TABLE products
ADD COLUMN is_hidden TINYINT(1) NOT NULL DEFAULT 0 AFTER availability;

UPDATE products
SET is_hidden = CASE WHEN deleted_at IS NULL THEN 0 ELSE 1 END
WHERE is_hidden IS NULL OR is_hidden NOT IN (0, 1);
