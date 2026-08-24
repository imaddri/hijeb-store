/*
  Migration: Add product and category codes

  Existing categories:
  H = Hijabs
  A = Abayas
  K = Khimars

  Existing products:
  H1, H2
  A1, A2
  K1, K2
*/

-- ======================================================
-- 1. ADD COLUMNS AS NULLABLE FIRST
-- ======================================================

ALTER TABLE "Category"
ADD COLUMN "code" TEXT;

ALTER TABLE "Product"
ADD COLUMN "productCode" TEXT;


-- ======================================================
-- 2. FILL EXISTING CATEGORY CODES
-- ======================================================

UPDATE "Category"
SET "code" = CASE
  WHEN "slug" = 'hijabs' THEN 'H'
  WHEN "slug" = 'abayas' THEN 'A'
  WHEN "slug" = 'khimars' THEN 'K'
  ELSE 'C'
END;


-- ======================================================
-- 3. FILL EXISTING PRODUCT CODES
-- ======================================================

UPDATE "Product"
SET "productCode" = CASE

  WHEN "slug" = 'luxury-silk-hijab'
    THEN 'H1'

  WHEN "slug" = 'luxury-crepe-hijab'
    THEN 'H2'

  WHEN "slug" = 'classic-black-abaya'
    THEN 'A1'

  WHEN "slug" = 'embroidered-abaya'
    THEN 'A2'

  WHEN "slug" = 'elegant-sharia-khimar'
    THEN 'K1'

  WHEN "slug" = 'premium-wide-khimar'
    THEN 'K2'

  ELSE
    'P' || SUBSTRING("id", 1, 5)

END;


-- ======================================================
-- 4. MAKE COLUMNS REQUIRED
-- ======================================================

ALTER TABLE "Category"
ALTER COLUMN "code" SET NOT NULL;

ALTER TABLE "Product"
ALTER COLUMN "productCode" SET NOT NULL;


-- ======================================================
-- 5. UNIQUE CONSTRAINTS
-- ======================================================

CREATE UNIQUE INDEX "Category_code_key"
ON "Category"("code");

CREATE UNIQUE INDEX "Product_productCode_key"
ON "Product"("productCode");


-- ======================================================
-- 6. PRODUCT CODE INDEX
-- ======================================================

CREATE INDEX "Product_productCode_idx"
ON "Product"("productCode");