-- Add property_type column to properties table
ALTER TABLE public.properties 
ADD COLUMN property_type TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN public.properties.property_type IS 'Type of accommodation: seaside, pool, cabin, lake, family, mountain, wellness, pets';

-- Create index for faster filtering
CREATE INDEX idx_properties_property_type ON public.properties(property_type);