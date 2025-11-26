import { Clock, Dog, Cigarette, Users } from "lucide-react";

interface HouseRulesProps {
  checkInTime?: string;
  checkOutTime?: string;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  maxGuests: number;
}

export const HouseRules = ({
  checkInTime = "16:00",
  checkOutTime = "10:00",
  petsAllowed = false,
  smokingAllowed = false,
  maxGuests,
}: HouseRulesProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Règlement intérieur</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <Clock className="text-primary mt-1" size={20} />
          <div>
            <p className="font-medium">Arrivée / Départ</p>
            <p className="text-sm text-muted-foreground">
              Arrivée à partir de {checkInTime}<br />
              Départ avant {checkOutTime}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Dog className="text-primary mt-1" size={20} />
          <div>
            <p className="font-medium">Animaux</p>
            <p className="text-sm text-muted-foreground">
              {petsAllowed ? "Animaux autorisés" : "Animaux non autorisés"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Cigarette className="text-primary mt-1" size={20} />
          <div>
            <p className="font-medium">Fumeur</p>
            <p className="text-sm text-muted-foreground">
              {smokingAllowed ? "Fumeur autorisé" : "Non fumeur"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users className="text-primary mt-1" size={20} />
          <div>
            <p className="font-medium">Nombre de voyageurs</p>
            <p className="text-sm text-muted-foreground">
              Maximum {maxGuests} personnes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};