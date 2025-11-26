import { Button } from "@/components/ui/button";

interface MobileBookingBarProps {
  pricePerNight: number;
  onBookClick: () => void;
}

export const MobileBookingBar = ({ pricePerNight, onBookClick }: MobileBookingBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg lg:hidden">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-lg font-bold">
            {pricePerNight}€ <span className="text-sm font-normal text-muted-foreground">/ nuit</span>
          </p>
        </div>
        <Button onClick={onBookClick} size="lg">
          Réserver
        </Button>
      </div>
    </div>
  );
};