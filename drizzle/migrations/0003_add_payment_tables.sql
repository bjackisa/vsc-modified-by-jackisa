-- Create payments table
CREATE TABLE IF NOT EXISTS "payments" (
    "id" text PRIMARY KEY,
    "application_id" text NOT NULL REFERENCES "applications" ("id") ON DELETE CASCADE,
    "payment_type" text NOT NULL,
    "status" text NOT NULL DEFAULT 'not_updated',
    "amount" decimal(10, 2) DEFAULT 0,
    "currency" text DEFAULT 'USD',
    "account_details" text,
    "notes" text,
    "updated_by" text REFERENCES "users" ("id"),
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create payment_receipts table
CREATE TABLE IF NOT EXISTS "payment_receipts" (
    "id" text PRIMARY KEY,
    "payment_id" text NOT NULL REFERENCES "payments" ("id") ON DELETE CASCADE,
    "blob_url" text NOT NULL,
    "mime_type" text NOT NULL,
    "name" text NOT NULL,
    "uploaded_by" text REFERENCES "users" ("id"),
    "created_at" timestamp NOT NULL DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS "payments_application_id_idx" ON "payments" ("application_id");
CREATE INDEX IF NOT EXISTS "payment_receipts_payment_id_idx" ON "payment_receipts" ("payment_id");
