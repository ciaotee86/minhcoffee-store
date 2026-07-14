/*
# Create menu_items, reservations, and admins tables for Cà phê Minh

1. Overview
- Three tables: `admins` (created first, referenced by policies), `menu_items`, `reservations`.
- Admin access gated by `admins` table membership checked via `auth.uid()`.
- Idempotent: safe to re-run.

2. New Tables
- `admins`: user_id (references auth.users), created_at
- `menu_items`: id, name, description, price (int thousand VND), category, image_url, available, sort_order, created_at
- `reservations`: id, name, phone, date, time, guests, note, status, created_at

3. Security
- admins: self-read only.
- menu_items: public SELECT; admin INSERT/UPDATE/DELETE.
- reservations: public INSERT + SELECT; admin UPDATE/DELETE.
*/

-- ---------- admins (must exist before policies reference it) ----------
CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_admins" ON admins;
CREATE POLICY "admin_read_admins" ON admins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- ---------- menu_items ----------
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL,
  category text NOT NULL DEFAULT 'coffee',
  image_url text NOT NULL DEFAULT '',
  available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_menu" ON menu_items;
CREATE POLICY "public_read_menu" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_menu" ON menu_items;
CREATE POLICY "admin_insert_menu" ON menu_items FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_menu" ON menu_items;
CREATE POLICY "admin_update_menu" ON menu_items FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_menu" ON menu_items;
CREATE POLICY "admin_delete_menu" ON menu_items FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ---------- reservations ----------
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_reservation" ON reservations;
CREATE POLICY "public_insert_reservation" ON reservations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_reservation_by_phone" ON reservations;
CREATE POLICY "public_read_reservation_by_phone" ON reservations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_reservation" ON reservations;
CREATE POLICY "admin_update_reservation" ON reservations FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_reservation" ON reservations;
CREATE POLICY "admin_delete_reservation" ON reservations FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ---------- indexes ----------
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_sort ON menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_res_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_res_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_res_phone ON reservations(phone);
