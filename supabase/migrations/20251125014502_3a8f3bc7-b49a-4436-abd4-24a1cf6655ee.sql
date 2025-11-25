-- Add amenities and additional fields to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Update existing properties to have images array with current image_url
UPDATE public.properties 
SET images = jsonb_build_array(
  jsonb_build_object(
    'url', image_url,
    'alt', title
  )
)
WHERE image_url IS NOT NULL AND images = '[]'::jsonb;

-- Add some sample amenities for existing properties
UPDATE public.properties 
SET amenities = '[
  "WiFi",
  "Cuisine équipée",
  "Parking gratuit",
  "Télévision",
  "Lave-linge"
]'::jsonb
WHERE amenities = '[]'::jsonb;