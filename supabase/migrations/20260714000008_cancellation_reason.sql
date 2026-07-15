ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS cancellation_reason text;
