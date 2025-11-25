import { useState } from "react";
import { Users, User, Baby, PawPrint } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GuestSelection } from "@/types/search";

interface SearchGuestsProps {
  value: GuestSelection;
  onChange: (guests: GuestSelection) => void;
}

export const SearchGuests = ({ value, onChange }: SearchGuestsProps) => {
  const [open, setOpen] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);

  const getGuestSummary = () => {
    const total = value.adults + value.children;
    if (total === 0) return "Voyageurs";
    if (total === 1) return "1 pers.";
    return `${total} pers.`;
  };

  const updateGuests = (type: "adults" | "children", increment: boolean) => {
    const newValue = { ...value };
    if (increment) {
      newValue[type] += 1;
    } else {
      newValue[type] = Math.max(type === "adults" ? 1 : 0, newValue[type] - 1);
    }
    onChange(newValue);
  };

  const addChild = () => {
    onChange({ ...value, children: value.children + 1 });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-3 bg-background rounded-lg px-4 py-3 border border-border cursor-pointer hover:border-primary/50 transition-colors">
          <Users className="text-muted-foreground" size={20} />
          <div className="flex-1 text-sm">
            {getGuestSummary()}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-6" align="start" sideOffset={8}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User size={20} className="text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium">Adultes</div>
                <div className="text-sm text-muted-foreground">18 ans et plus</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuests("adults", false)}
                disabled={value.adults === 1}
              >
                <span className="text-lg">−</span>
              </Button>
              <span className="w-8 text-center font-medium">{value.adults}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuests("adults", true)}
              >
                <span className="text-lg">+</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Baby size={20} className="text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium">Enfants</div>
                <div className="text-sm text-muted-foreground">0 à 17</div>
              </div>
            </div>
            {value.children === 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-6"
                onClick={addChild}
              >
                Ajouter
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => updateGuests("children", false)}
                >
                  <span className="text-lg">−</span>
                </Button>
                <span className="w-8 text-center font-medium">{value.children}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => updateGuests("children", true)}
                >
                  <span className="text-lg">+</span>
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <PawPrint size={20} className="text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium">Animaux acceptés</div>
              </div>
            </div>
            <Switch checked={petsAllowed} onCheckedChange={setPetsAllowed} />
          </div>

          <Button
            className="w-full rounded-full"
            onClick={() => setOpen(false)}
          >
            Fermer
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
