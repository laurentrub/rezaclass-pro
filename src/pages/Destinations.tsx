import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { destinations } from "@/constants/destinations";

const Destinations = () => {
  const navigate = useNavigate();

  const handleDestinationClick = (destination: string) => {
    navigate(`/search?destination=${encodeURIComponent(destination)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Destinations en France</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
          Découvrez nos destinations les plus populaires à travers la France. De la Méditerranée aux Alpes, 
          des plages bretonnes aux villages provençaux, trouvez votre prochaine escapade idéale.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <div
              key={destination.name}
              onClick={() => handleDestinationClick(destination.name)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-card-foreground mb-2">{destination.name}</h2>
                <p className="text-muted-foreground">{destination.description}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16 bg-card rounded-xl p-8 border border-border">
          <h2 className="text-3xl font-bold text-card-foreground mb-6">Pourquoi Choisir Nos Destinations ?</h2>
          <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Diversité des Paysages</h3>
              <p>
                De la mer à la montagne, des vignobles aux forêts, la France offre une incroyable variété 
                de paysages. Chaque région possède son charme unique et ses traditions propres.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Patrimoine Culturel</h3>
              <p>
                Découvrez des villages classés, des châteaux historiques, des sites UNESCO et une gastronomie 
                d'exception. Chaque destination est une porte ouverte sur l'histoire et la culture françaises.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Activités pour Tous</h3>
              <p>
                Randonnée, sports nautiques, ski, œnotourisme, détente en spa... Nos destinations proposent 
                des activités adaptées à tous les âges et tous les goûts.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Hébergements Authentiques</h3>
              <p>
                Nos propriétaires locaux vous accueillent dans des hébergements soigneusement sélectionnés, 
                alliant confort moderne et charme authentique.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Destinations;
