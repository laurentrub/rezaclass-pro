-- Add payment_proof_url column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN payment_proof_url TEXT;

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false);

-- Create RLS policies for payment-proofs bucket
CREATE POLICY "Users can upload their own payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete payment proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Add proof_submitted status to payment_status enum options
COMMENT ON COLUMN public.bookings.payment_status IS 'Payment status: pending, proof_submitted, received, transferred_to_owner';