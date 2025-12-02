-- Add unique constraint to prevent duplicate reviews per user per property
ALTER TABLE public.reviews 
ADD CONSTRAINT unique_user_property_review UNIQUE (user_id, property_id);

-- Add booking_id column for traceability (optional link to the booking)
ALTER TABLE public.reviews 
ADD COLUMN booking_id uuid REFERENCES public.bookings(id);

-- Drop existing insert policy
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;

-- Create new policy: only verified guests with completed stays can create reviews
CREATE POLICY "Verified guests can create reviews" ON public.reviews
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.user_id = auth.uid()
    AND bookings.property_id = reviews.property_id
    AND bookings.status = 'confirmed'
    AND bookings.check_out_date < CURRENT_DATE
  )
);