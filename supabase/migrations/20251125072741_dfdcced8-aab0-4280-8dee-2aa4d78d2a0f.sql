-- Create property_owners table
CREATE TABLE public.property_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  commission_rate NUMERIC DEFAULT 15.00,
  bank_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on property_owners
ALTER TABLE public.property_owners ENABLE ROW LEVEL SECURITY;

-- RLS policies for property_owners
CREATE POLICY "Admins can view all property owners"
ON public.property_owners
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert property owners"
ON public.property_owners
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update property owners"
ON public.property_owners
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete property owners"
ON public.property_owners
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add columns to properties table
ALTER TABLE public.properties
ADD COLUMN owner_id UUID REFERENCES public.property_owners(id),
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
ADD COLUMN available_from DATE,
ADD COLUMN available_until DATE;

-- Add columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'received', 'transferred_to_owner')),
ADD COLUMN owner_payout_amount NUMERIC,
ADD COLUMN admin_commission NUMERIC,
ADD COLUMN admin_notes TEXT;

-- Create blocked_periods table
CREATE TABLE public.blocked_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on blocked_periods
ALTER TABLE public.blocked_periods ENABLE ROW LEVEL SECURITY;

-- RLS policies for blocked_periods
CREATE POLICY "Admins can view all blocked periods"
ON public.blocked_periods
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert blocked periods"
ON public.blocked_periods
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update blocked periods"
ON public.blocked_periods
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blocked periods"
ON public.blocked_periods
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for property_owners updated_at
CREATE TRIGGER update_property_owners_updated_at
BEFORE UPDATE ON public.property_owners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();