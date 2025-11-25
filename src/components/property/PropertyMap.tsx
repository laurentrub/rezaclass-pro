import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
}

export const PropertyMap = ({ latitude, longitude, title, address }: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      console.error("Mapbox token non configuré");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: 13,
    });

    // Add marker
    new mapboxgl.Marker({ color: "#8B5CF6" })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <h3 class="font-semibold">${title}</h3>
            ${address ? `<p class="text-sm text-muted-foreground">${address}</p>` : ""}
          </div>`
        )
      )
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, title, address]);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
