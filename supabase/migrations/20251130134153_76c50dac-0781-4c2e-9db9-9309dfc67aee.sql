-- Allow public read access to blocked_periods so users can see when properties are unavailable
CREATE POLICY "Anyone can view blocked periods"
ON public.blocked_periods
FOR SELECT
USING (true);