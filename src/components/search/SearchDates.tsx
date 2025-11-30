import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateSelection } from "@/types/search";

interface SearchDatesProps {
  value: DateSelection;
  onChange: (dates: DateSelection) => void;
}

const DURATIONS = [
  { value: "weekend", label: "Week-end" },
  { value: "1week", label: "1 semaine" },
  { value: "1month", label: "1 mois" },
  { value: "flexible", label: "1 semaine, Dates indifférentes" },
];

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export const SearchDates = ({ value, onChange }: SearchDatesProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"flexible" | "specific">(value.mode);

  const getDateSummary = () => {
    if (mode === "specific" && value.checkIn && value.checkOut) {
      return `${format(value.checkIn, "d MMM", { locale: fr })} - ${format(value.checkOut, "d MMM", { locale: fr })}`;
    }
    if (mode === "flexible") {
      const duration = DURATIONS.find((d) => d.value === value.duration);
      const monthsPart = value.months?.length ? value.months.join(", ") : "1 semaine";
      return duration ? `${duration.label}, ${monthsPart}` : "Dates flexibles";
    }
    return "Dates";
  };

  const handleDurationChange = (duration: string) => {
    onChange({
      mode: "flexible",
      duration: duration as DateSelection["duration"],
      months: value.months || [],
    });
  };

  const handleMonthToggle = (month: string) => {
    const currentMonths = value.months || [];
    const newMonths = currentMonths.includes(month)
      ? currentMonths.filter((m) => m !== month)
      : [...currentMonths, month];

    onChange({
      mode: "flexible",
      duration: value.duration,
      months: newMonths,
    });
  };

  const handleSpecificDateChange = (checkIn: Date | undefined, checkOut: Date | undefined) => {
    onChange({
      mode: "specific",
      checkIn,
      checkOut,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-3 bg-background rounded-lg px-4 py-3 border border-border cursor-pointer hover:border-primary/50 transition-colors">
          <CalendarIcon className="text-muted-foreground" size={20} />
          <div className="flex-1 text-sm">{getDateSummary()}</div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start" sideOffset={8}>
        <Tabs value={mode} onValueChange={(v) => setMode(v as "flexible" | "specific")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 m-2">
            <TabsTrigger value="flexible">Flexibles</TabsTrigger>
            <TabsTrigger value="specific">Spécifiques</TabsTrigger>
          </TabsList>

          <TabsContent value="flexible" className="p-6 space-y-6 m-0">
            <div>
              <h4 className="text-sm font-semibold mb-3">Durée du séjour</h4>
              <div className="grid grid-cols-2 gap-3">
                {DURATIONS.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => handleDurationChange(duration.value)}
                    className={cn(
                      "px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium",
                      value.duration === duration.value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background hover:bg-accent border-border hover:border-primary/30",
                    )}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Mois</h4>
              <div className="grid grid-cols-4 gap-2">
                {MONTHS.map((month) => (
                  <button
                    key={month}
                    onClick={() => handleMonthToggle(month)}
                    className={cn(
                      "px-2 py-2 rounded-lg border-2 transition-all text-xs font-medium",
                      value.months?.includes(month)
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background hover:bg-accent border-border hover:border-primary/30",
                    )}
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specific" className="p-6 m-0">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-3">Date d'arrivée</h4>
                <Calendar
                  mode="single"
                  selected={value.checkIn}
                  onSelect={(date) => handleSpecificDateChange(date, value.checkOut)}
                  disabled={(date) => date < new Date()}
                  className="pointer-events-auto rounded-md border"
                />
              </div>
              {value.checkIn && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Date de départ</h4>
                  <Calendar
                    mode="single"
                    selected={value.checkOut}
                    onSelect={(date) => handleSpecificDateChange(value.checkIn, date)}
                    disabled={(date) => date < (value.checkIn || new Date())}
                    className="pointer-events-auto rounded-md border"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
