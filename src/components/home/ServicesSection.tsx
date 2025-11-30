import { Shield, CreditCard, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ServicesSection = () => {
  const services = [
    {
      icon: Shield,
      title: "Annulation gratuite",
      description: "Annulez gratuitement jusqu'à 24h avant votre arrivée",
    },
    {
      icon: CreditCard,
      title: "Paiement sécurisé",
      description: "Vos transactions sont protégées et sécurisées",
    },
    {
      icon: Headphones,
      title: "Assistance 24/7",
      description: "Notre équipe est disponible à tout moment pour vous aider",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Nos services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Voyagez l'esprit tranquille avec nos garanties et services premium
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <Card
              key={index}
              className="border-border bg-card hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-card-foreground">
                  {service.title}
                </h3>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
