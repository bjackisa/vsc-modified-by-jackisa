-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT REFERENCES applications(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL,
  status TEXT DEFAULT 'not_updated' NOT NULL,
  amount DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  account_details TEXT,
  notes TEXT,
  updated_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_receipts table
CREATE TABLE IF NOT EXISTS payment_receipts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT REFERENCES payments(id) ON DELETE CASCADE,
  blob_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  name TEXT NOT NULL,
  uploaded_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 