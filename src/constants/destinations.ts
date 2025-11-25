import { Destination } from "@/types/search";

export const POPULAR_DESTINATIONS: Destination[] = [
  { name: "Paris", region: "Île-de-France", country: "France" },
  { name: "Lyon", region: "Auvergne-Rhône-Alpes", country: "France" },
  { name: "Marseille", region: "Provence-Alpes-Côte d'Azur", country: "France" },
  { name: "Nice", region: "Provence-Alpes-Côte d'Azur", country: "France" },
  { name: "Bordeaux", region: "Nouvelle-Aquitaine", country: "France" },
  { name: "Toulouse", region: "Occitanie", country: "France" },
  { name: "Strasbourg", region: "Grand Est", country: "France" },
  { name: "Nantes", region: "Pays de la Loire", country: "France" },
  { name: "Montpellier", region: "Occitanie", country: "France" },
  { name: "Lille", region: "Hauts-de-France", country: "France" },
  { name: "Bretagne", region: "Bretagne", country: "France" },
  { name: "Côte d'Azur", region: "Provence-Alpes-Côte d'Azur", country: "France" },
  { name: "Alpes", region: "Auvergne-Rhône-Alpes", country: "France" },
  { name: "Corse", region: "Corse", country: "France" },
  { name: "Provence", region: "Provence-Alpes-Côte d'Azur", country: "France" },
];

const RECENT_SEARCHES_KEY = "recent-destination-searches";
const MAX_RECENT_SEARCHES = 5;

export const getRecentSearches = (): Destination[] => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveRecentSearch = (destination: Destination) => {
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter(d => d.name !== destination.name);
    const updated = [destination, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is not available
  }
};
