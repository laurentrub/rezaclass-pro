-- Create payment status history table
CREATE TABLE IF NOT EXISTS public.payment_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.payment_status_history ENABLE ROW LEVEL SECURITY;

-- Allow admins to view history
CREATE POLICY "Admins can view payment history"
  ON public.payment_status_history
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert history
CREATE POLICY "Admins can insert payment history"
  ON public.payment_status_history
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_history_booking_id 
  ON public.payment_status_history(booking_id);

-- Create trigger function to automatically log payment status changes
CREATE OR REPLACE FUNCTION public.log_payment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if payment_status actually changed
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
    INSERT INTO public.payment_status_history (
      booking_id,
      old_status,
      new_status,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.payment_status,
      NEW.payment_status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on bookings table
DROP TRIGGER IF EXISTS on_booking_payment_status_change ON public.bookings;
CREATE TRIGGER on_booking_payment_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_payment_status_change();