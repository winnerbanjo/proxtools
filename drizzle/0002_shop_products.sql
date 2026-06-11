ALTER TYPE "order_kind" ADD VALUE IF NOT EXISTS 'PRODUCT';

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "product_id" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "product_name" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "product_quantity" integer;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "product_details" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "external_ref" text;
