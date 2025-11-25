import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { addDays, isSameDay, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AvailabilityCalendarProps {
  bookedDates?: Date[];
  onSelectDates?: (checkIn: Date | undefined, checkOut: Date | undefined) => void;
}

export const AvailabilityCalendar = ({ 
  bookedDates = [], 
  onSelectDates 
}: AvailabilityCalendarProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [hoveredDate, setHoveredDate] = useState<Date>();

  const isDateBooked = (date: Date) => {
    return bookedDates.some((bookedDate) => isSameDay(date, bookedDate));
  };

  const isDateInRange = (date: Date) => {
    if (!checkIn || !hoveredDate) return false;
    if (hoveredDate < checkIn) return false;
    return isWithinInterval(date, { start: checkIn, end: hoveredDate });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // If date is booked, do nothing
    if (isDateBooked(date)) return;

    // If no check-in date or both dates are set, start new selection
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(undefined);
      onSelectDates?.(date, undefined);
    } else {
      // If check-in is set and new date is after check-in
      if (date > checkIn) {
        setCheckOut(date);
        onSelectDates?.(checkIn, date);
      } else {
        // If new date is before check-in, swap them
        setCheckIn(date);
        setCheckOut(undefined);
        onSelectDates?.(date, undefined);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span>Sélectionné</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <span>Réservé</span>
        </div>
      </div>

      <Calendar
        mode="single"
        selected={checkIn}
        onSelect={handleDateSelect}
        disabled={(date) => date < new Date() || isDateBooked(date)}
        locale={fr}
        className={cn("rounded-md border pointer-events-auto")}
        modifiers={{
          booked: bookedDates,
          checkIn: checkIn ? [checkIn] : [],
          checkOut: checkOut ? [checkOut] : [],
          inRange: (date) => isDateInRange(date),
        }}
        modifiersStyles={{
          booked: {
            backgroundColor: "hsl(var(--muted))",
            color: "hsl(var(--muted-foreground))",
            textDecoration: "line-through",
          },
          checkIn: {
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          },
          checkOut: {
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          },
          inRange: {
            backgroundColor: "hsl(var(--primary) / 0.2)",
          },
        }}
        onDayMouseEnter={setHoveredDate}
        onDayMouseLeave={() => setHoveredDate(undefined)}
      />

      {checkIn && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="font-medium mb-2">Dates sélectionnées:</p>
          <p className="text-sm">
            Arrivée: {checkIn.toLocaleDateString("fr-FR", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })}
          </p>
          {checkOut && (
            <p className="text-sm">
              Départ: {checkOut.toLocaleDateString("fr-FR", { 
                day: "numeric", 
                month: "long", 
                year: "numeric" 
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
