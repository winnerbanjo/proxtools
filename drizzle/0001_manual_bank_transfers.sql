ALTER TYPE "record_status" ADD VALUE IF NOT EXISTS 'Declined';

CREATE TABLE IF NOT EXISTS "admin_bank_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "bank_name" text NOT NULL,
  "account_name" text NOT NULL,
  "account_number" text NOT NULL,
  "instructions" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "deposits" ADD COLUMN IF NOT EXISTS "proof_asset_id" uuid;
ALTER TABLE "deposits" ADD COLUMN IF NOT EXISTS "proof_url" text;
ALTER TABLE "deposits" ADD COLUMN IF NOT EXISTS "reviewed_by" uuid;
ALTER TABLE "deposits" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;
ALTER TABLE "deposits" ALTER COLUMN "status" SET DEFAULT 'Pending';

DO $$ BEGIN
  ALTER TABLE "deposits" ADD CONSTRAINT "deposits_proof_asset_id_assets_id_fk" FOREIGN KEY ("proof_asset_id") REFERENCES "assets"("id") ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "deposits" ADD CONSTRAINT "deposits_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
