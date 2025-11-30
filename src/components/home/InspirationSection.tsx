import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";

const InspirationSection = () => {
  const navigate = useNavigate();

  const handleLinkClick = (e: React.MouseEvent, destination: string) => {
    e.preventDefault();
    navigate(`/search?destination=${encodeURIComponent(destination)}`);
  };
  const inspirationCategories = [
    {
      id: "destinations-phares",
      title: "Destinations phares",
      links: [
        "Paris", "Lyon", "Marseille", "Nice", "Bordeaux", "Toulouse", 
        "Strasbourg", "Nantes", "Montpellier", "Lille"
      ]
    },
    {
      id: "sejours-exception",
      title: "Séjours d'exception",
      links: [
        "Châteaux et demeures historiques", "Villas de luxe avec piscine", 
        "Maisons d'architecte", "Propriétés avec vue mer"
      ]
    },
    {
      id: "destinations-vogue",
      title: "Destinations en vogue",
      links: [
        "Côte d'Azur", "Bretagne", "Provence", "Alpes", 
        "Corse", "Normandie", "Pays Basque", "Dordogne"
      ]
    },
    {
      id: "villas",
      title: "Destinations prisées pour les villas",
      links: [
        "Villas en Provence", "Villas en Côte d'Azur", 
        "Villas en Corse", "Villas dans le Sud-Ouest"
      ]
    },
    {
      id: "appartements",
      title: "Destinations pour louer un appartement",
      links: [
        "Appartements à Paris", "Appartements à Lyon", 
        "Appartements à Marseille", "Appartements à Bordeaux"
      ]
    },
    {
      id: "conseils",
      title: "Conseils de voyage et inspiration",
      links: [
        "Où partir en famille", "Les plus belles plages de France", 
        "Destinations romantiques", "Vacances à la montagne"
      ]
    },
    {
      id: "longue-duree",
      title: "Séjournez plus longtemps et économisez",
      links: [
        "Locations mensuelles", "Réductions pour longs séjours", 
        "Locations à l'année", "Offres spéciales résidents"
      ]
    }
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
          Plus d'idées de vacances
        </h2>
        
        <Accordion type="single" collapsible className="w-full space-y-2">
          {inspirationCategories.map((category) => (
            <AccordionItem 
              key={category.id} 
              value={category.id}
              className="border border-border bg-card rounded-lg px-6"
            >
              <AccordionTrigger className="text-lg font-semibold text-card-foreground hover:text-primary hover:no-underline">
                {category.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                  {category.links.map((link, index) => (
                    <a
                      key={index}
                      href="#"
                      onClick={(e) => handleLinkClick(e, link)}
                      className="text-muted-foreground hover:text-primary transition-colors underline cursor-pointer"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default InspirationSection;
