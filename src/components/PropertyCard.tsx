import { MapPin, Users, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  id?: string;
  image: string;
  title: string;
  location: string;
  price: number;
  guests: number;
  rating: number;
}

export const PropertyCard = ({ id, image, title, location, price, guests, rating }: PropertyCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (id) {
      navigate(`/property/${id}`);
    }
  };

  return (
    <Card 
      className="group overflow-hidden border-border hover:shadow-xl transition-all duration-300 cursor-pointer bg-card"
      onClick={handleClick}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1 bg-accent text-accent-foreground px-2 py-1 rounded-full text-sm font-medium">
            <Star size={14} className="fill-current" />
            {rating}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin size={16} />
          <span className="text-sm">{location}</span>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users size={16} />
            <span className="text-sm">{guests} personnes</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{price}€</span>
            <span className="text-sm text-muted-foreground"> / nuit</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
