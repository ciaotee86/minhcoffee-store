-- Enums
CREATE TYPE public.reservation_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE public.notification_status AS ENUM ('PENDING', 'SENT', 'FAILED');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Sync timestamps trigger function
CREATE OR REPLACE FUNCTION public.sync_reservation_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'CONFIRMED' AND OLD.status != 'CONFIRMED' THEN
        NEW.confirmed_at = now();
    ELSIF NEW.status != 'CONFIRMED' THEN
        NEW.confirmed_at = NULL;
    END IF;

    IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
        NEW.cancelled_at = now();
    ELSIF NEW.status != 'CANCELLED' THEN
        NEW.cancelled_at = NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Admins table
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX admins_user_id_idx ON public.admins(user_id);

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';
