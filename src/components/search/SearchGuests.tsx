import { Users, Plus, Minus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { GuestSelection } from "@/types/search";

interface SearchGuestsProps {
  value: GuestSelection;
  onChange: (guests: GuestSelection) => void;
}

export const SearchGuests = ({ value, onChange }: SearchGuestsProps) => {
  const getGuestSummary = () => {
    const total = value.adults + value.children;
    if (total === 0) return "Voyageurs";
    if (total === 1) return "1 voyageur";
    return `${total} voyageurs`;
  };

  const updateGuests = (type: "adults" | "children", increment: boolean) => {
    const newValue = { ...value };
    if (increment) {
      newValue[type] += 1;
    } else {
      newValue[type] = Math.max(0, newValue[type] - 1);
    }
    onChange(newValue);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-3 bg-background rounded-lg px-4 py-3 border border-border cursor-pointer hover:border-primary/50 transition-colors">
          <Users className="text-muted-foreground" size={20} />
          <div className="flex-1 text-sm">
            {getGuestSummary()}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Adultes</div>
              <div className="text-sm text-muted-foreground">13 ans et plus</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateGuests("adults", false)}
                disabled={value.adults === 0}
              >
                <Minus size={16} />
              </Button>
              <span className="w-8 text-center">{value.adults}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateGuests("adults", true)}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enfants</div>
              <div className="text-sm text-muted-foreground">2-12 ans</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateGuests("children", false)}
                disabled={value.children === 0}
              >
                <Minus size={16} />
              </Button>
              <span className="w-8 text-center">{value.children}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateGuests("children", true)}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
