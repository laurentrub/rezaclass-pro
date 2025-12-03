import { useNavigate } from "react-router-dom";

const AboutSection = () => {
  const navigate = useNavigate();

  const handleDestinationClick = (destination: string) => {
    navigate(`/search?destination=${encodeURIComponent(destination)}`);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="space-y-16">
          {/* First Block */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Rezaclass réinvente la location de vacances
            </h2>
            <div className="text-lg text-muted-foreground space-y-4">
              <p>
                Saviez-vous que Rezaclass vous propose des milliers de locations de vacances à travers la France ? 
                De quoi trouver un espace confortable et hors du temps pour vous offrir une délicieuse parenthèse, 
                que vous rêviez d'un séjour en famille, d'un périple sportif entre amis ou d'une escapade romantique.
              </p>
              <p>
                Et parce que les vacances doivent être un plaisir de A à Z, la réservation via Rezaclass 
                vous permet de bénéficier de notre <span className="text-primary font-semibold">garantie réservation en toute confiance</span> et ce, 
                de la date de votre paiement sur notre plateforme jusqu'à votre retour à la maison. 
                En d'autres termes, lorsque vous réservez et payez par Rezaclass, nous sommes là pour vous, 
                avant, pendant et même après votre séjour.
              </p>
              <p>
                Pour votre sécurité, ne donnez jamais suite aux messages de personnes vous demandant de réserver 
                ou de payer directement auprès d'elles sans effectuer de réservation sur Rezaclass.
              </p>
            </div>
          </div>

          {/* Second Block */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Alliez espace et bien-être avec la location de vacances
            </h2>
            <div className="text-lg text-muted-foreground space-y-4">
              <p>
                La location saisonnière est avant tout le plaisir de retrouver le confort et la commodité de votre 
                chez-vous à l'autre bout de la France. C'est aussi la solution idéale pour bénéficier de tout l'espace 
                dont vous avez besoin pour vous accorder des moments de qualité, de l'appartement avec cuisine complètement 
                équipée au confortable bungalow avec piscine.
              </p>
              <p>
                Envie de retrouver votre petite tribu au cœur d'un chalet traditionnel, d'un cottage qui fleure bon 
                le bord de mer, d'un appartement moderne ou d'une villa au charme international ? Besoin de vous détendre 
                au son des vagues, de dormir au sommet des montagnes ou de poser vos valises au sein d'une impressionnante 
                mégalopole ? La location de vacances entre particuliers est la solution toute trouvée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
