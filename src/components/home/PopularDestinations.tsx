import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

import provenceImg from "@/assets/destinations/provence.jpg";
import coteAzurImg from "@/assets/destinations/cote-azur.jpg";
import bretagneImg from "@/assets/destinations/bretagne.jpg";
import alpesImg from "@/assets/destinations/alpes.jpg";
import normandieImg from "@/assets/destinations/normandie.jpg";
import corseImg from "@/assets/destinations/corse.jpg";

interface Destination {
  name: string;
  region: string;
  image: string;
  properties: number;
  description: string;
}

const destinations: Destination[] = [
  {
    name: "Provence",
    region: "Provence-Alpes-Côte d'Azur",
    image: provenceImg,
    properties: 245,
    description: "Champs de lavande et villages perchés"
  },
  {
    name: "Côte d'Azur",
    region: "Provence-Alpes-Côte d'Azur",
    image: coteAzurImg,
    properties: 412,
    description: "Mer turquoise et luxe méditerranéen"
  },
  {
    name: "Bretagne",
    region: "Bretagne",
    image: bretagneImg,
    properties: 328,
    description: "Côtes sauvages et patrimoine celte"
  },
  {
    name: "Alpes",
    region: "Auvergne-Rhône-Alpes",
    image: alpesImg,
    properties: 289,
    description: "Sommets majestueux et nature préservée"
  },
  {
    name: "Normandie",
    region: "Normandie",
    image: normandieImg,
    properties: 198,
    description: "Falaises blanches et charme bucolique"
  },
  {
    name: "Corse",
    region: "Corse",
    image: corseImg,
    properties: 267,
    description: "Île de beauté aux plages paradisiaques"
  }
];

export const PopularDestinations = () => {
  const navigate = useNavigate();

  const handleDestinationClick = (destination: Destination) => {
    navigate(`/search?destination=${encodeURIComponent(destination.name)}`);
  };

  return (
    <section className="py-16 container mx-auto px-4 md:px-8 max-w-7xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Destinations populaires en France
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Découvrez nos régions les plus prisées et trouvez votre prochaine destination de rêve
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination) => (
          <button
            key={destination.name}
            onClick={() => handleDestinationClick(destination)}
            className="group relative overflow-hidden rounded-2xl h-80 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {/* Image with overlay */}
            <div className="absolute inset-0">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-left">
              <div className="transform transition-transform duration-300 group-hover:translate-y-[-8px]">
                <h3 className="text-3xl font-bold text-white mb-2">
                  {destination.name}
                </h3>
                <div className="flex items-center gap-2 text-white/90 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{destination.region}</span>
                </div>
                <p className="text-white/80 text-sm mb-3 line-clamp-2">
                  {destination.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    {destination.properties} propriétés
                  </span>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-5 h-5 text-primary-foreground"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
