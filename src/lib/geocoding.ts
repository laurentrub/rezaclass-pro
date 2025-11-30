const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export interface Address {
  street: string;
  postalCode: string;
  city: string;
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * Geocode an address using Mapbox Geocoding API
 * @param address - The address components to geocode
 * @returns The coordinates and formatted address
 */
export async function geocodeAddress(address: Address): Promise<GeocodingResult | null> {
  if (!MAPBOX_TOKEN) {
    console.error("Mapbox token not configured");
    return null;
  }

  // Build the search query
  const query = `${address.street}, ${address.postalCode} ${address.city}, France`;
  const encodedQuery = encodeURIComponent(query);

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${MAPBOX_TOKEN}&country=FR&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.center;

      return {
        latitude,
        longitude,
        formattedAddress: feature.place_name,
      };
    }

    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}
