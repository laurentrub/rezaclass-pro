-- Drop the existing constraint and recreate with 'proof_submitted' value
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE public.bookings ADD CONSTRAINT bookings_payment_status_check 
  CHECK (payment_status = ANY (ARRAY['pending', 'proof_submitted', 'received', 'transferred_to_owner']));