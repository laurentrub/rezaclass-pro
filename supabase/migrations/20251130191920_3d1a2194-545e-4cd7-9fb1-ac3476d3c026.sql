-- =====================================================
-- ADD MANAGER SUPPORT: COLUMNS AND RLS POLICIES
-- =====================================================

-- =====================================================
-- STEP 1: ADD REQUIRED COLUMNS
-- =====================================================

-- Add managed_by column to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS managed_by uuid REFERENCES auth.users(id);

-- Add created_by column to property_owners table
ALTER TABLE public.property_owners
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- =====================================================
-- STEP 2: UPDATE PROPERTIES RLS POLICIES
-- =====================================================

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;

-- Create new policies for admins and managers
CREATE POLICY "Admins and managers can view properties"
ON public.properties
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'manager'::app_role) AND managed_by = auth.uid())
);

CREATE POLICY "Admins and managers can insert properties"
ON public.properties
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'manager'::app_role) AND managed_by = auth.uid())
);

CREATE POLICY "Admins and managers can update properties"
ON public.properties
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'manager'::app_role) AND managed_by = auth.uid())
);

CREATE POLICY "Admins and managers can delete properties"
ON public.properties
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'manager'::app_role) AND managed_by = auth.uid())
);

-- =====================================================
-- STEP 3: UPDATE PROPERTY_OWNERS RLS POLICIES
-- =====================================================

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all property owners" ON public.property_owners;
DROP POLICY IF EXISTS "Admins can insert property owners" ON public.property_owners;
DROP POLICY IF EXISTS "Admins can update property owners" ON public.property_owners;
DROP POLICY IF EXISTS "Admins can delete property owners" ON public.property_owners;

-- Create new policies for admins and managers
CREATE POLICY "Admins and managers can view property owners"
ON public.property_owners
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'manager'::app_role) AND created_by = auth.uid())
);

CREATE POLICY "Admins and managers can insert property owners"
ON public.property_owners
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'manager'::app_role) AND created_by = auth.uid())
);

CREATE POLICY "Admins and managers can update property owners"
ON public.property_owners
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'manager'::app_role) AND created_by = auth.uid())
);

CREATE POLICY "Admins and managers can delete property owners"
ON public.property_owners
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'manager'::app_role) AND created_by = auth.uid())
);

-- =====================================================
-- STEP 4: UPDATE BLOCKED_PERIODS RLS POLICIES
-- =====================================================

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all blocked periods" ON public.blocked_periods;
DROP POLICY IF EXISTS "Admins can insert blocked periods" ON public.blocked_periods;
DROP POLICY IF EXISTS "Admins can update blocked periods" ON public.blocked_periods;
DROP POLICY IF EXISTS "Admins can delete blocked periods" ON public.blocked_periods;

-- Create new policies for admins and managers
CREATE POLICY "Admins and managers can view blocked periods"
ON public.blocked_periods
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'manager'::app_role)
    AND property_id IN (
      SELECT id FROM public.properties WHERE managed_by = auth.uid()
    )
  )
);

CREATE POLICY "Admins and managers can insert blocked periods"
ON public.blocked_periods
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'manager'::app_role)
    AND property_id IN (
      SELECT id FROM public.properties WHERE managed_by = auth.uid()
    )
  )
);

CREATE POLICY "Admins and managers can update blocked periods"
ON public.blocked_periods
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'manager'::app_role)
    AND property_id IN (
      SELECT id FROM public.properties WHERE managed_by = auth.uid()
    )
  )
);

CREATE POLICY "Admins and managers can delete blocked periods"
ON public.blocked_periods
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'manager'::app_role)
    AND property_id IN (
      SELECT id FROM public.properties WHERE managed_by = auth.uid()
    )
  )
);

-- =====================================================
-- STEP 5: UPDATE BOOKINGS RLS POLICIES
-- =====================================================

-- Drop existing admin-only policies (keep user policies)
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

-- Create new policies for admins and managers
CREATE POLICY "Admins and managers can view bookings"
ON public.bookings
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'manager'::app_role)
    AND property_id IN (
      SELECT id FROM public.properties WHERE managed_by = auth.uid()
    )
  )
);

CREATE POLICY "Admins and managers can update bookings"
ON public.bookings
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'manager'::app_role)
    AND property_id IN (
      SELECT id FROM public.properties WHERE managed_by = auth.uid()
    )
  )
);

CREATE POLICY "Admins and managers can delete bookings"
ON public.bookings
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'manager'::app_role)
    AND property_id IN (
      SELECT id FROM public.properties WHERE managed_by = auth.uid()
    )
  )
);