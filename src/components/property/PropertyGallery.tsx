import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PropertyImage {
  url: string;
  alt: string;
}

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

export const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const mainImage = images[selectedIndex] || images[0];
  const thumbnails = images.slice(0, 5);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
        {/* Main Image */}
        <div 
          className="col-span-4 md:col-span-2 md:row-span-2 relative group cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={mainImage.url}
            alt={mainImage.alt || title}
            className="w-full h-full object-cover aspect-[4/3] md:aspect-auto md:h-[500px]"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
        </div>

        {/* Thumbnail Grid */}
        {thumbnails.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer hidden md:block"
            onClick={() => {
              setSelectedIndex(index + 1);
              setIsLightboxOpen(true);
            }}
          >
            <img
              src={image.url}
              alt={image.alt || `${title} - Photo ${index + 2}`}
              className="w-full h-full object-cover aspect-square"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
          </div>
        ))}

        {images.length > 5 && (
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute bottom-4 right-4 bg-background px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-background/90 transition-colors"
          >
            Voir toutes les photos ({images.length})
          </button>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <div className="relative h-full flex items-center justify-center bg-foreground/95">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-background hover:bg-background/20"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X size={24} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-background hover:bg-background/20"
              onClick={handlePrevious}
            >
              <ChevronLeft size={32} />
            </Button>

            <img
              src={images[selectedIndex].url}
              alt={images[selectedIndex].alt || title}
              className="max-h-full max-w-full object-contain p-12"
            />

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-background hover:bg-background/20"
              onClick={handleNext}
            >
              <ChevronRight size={32} />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-background">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
