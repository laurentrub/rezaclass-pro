-- Change property_type column from TEXT to TEXT[] (array)
ALTER TABLE public.properties 
ALTER COLUMN property_type TYPE TEXT[] USING 
  CASE 
    WHEN property_type IS NULL THEN NULL
    WHEN property_type = '' THEN NULL
    ELSE ARRAY[property_type]
  END;

-- Update comment
COMMENT ON COLUMN public.properties.property_type IS 'Array of accommodation types: seaside, pool, cabin, lake, family, mountain, wellness, pets';

-- Update index to support array operations
DROP INDEX IF EXISTS idx_properties_property_type;
CREATE INDEX idx_properties_property_type ON public.properties USING GIN(property_type);