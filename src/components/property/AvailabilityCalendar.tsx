import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { addDays, isSameDay, isWithinInterval, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-day-picker/dist/style.css";

interface AvailabilityCalendarProps {
  bookedDates?: Date[];
  blockedDates?: Date[];
  onSelectDates?: (checkIn: Date | undefined, checkOut: Date | undefined) => void;
}

export const AvailabilityCalendar = ({ 
  bookedDates = [],
  blockedDates = [],
  onSelectDates 
}: AvailabilityCalendarProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [hoveredDate, setHoveredDate] = useState<Date>();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const isDateBooked = (date: Date) => {
    return bookedDates.some((bookedDate) => isSameDay(date, bookedDate));
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some((blockedDate) => isSameDay(date, blockedDate));
  };

  const isDateUnavailable = (date: Date) => {
    return isDateBooked(date) || isDateBlocked(date);
  };

  const allUnavailableDates = [...bookedDates, ...blockedDates];

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-orange-800">
          Choisissez la période du séjour pour avoir des prix plus précis
        </p>
      </div>

      <div className="relative">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Double Month Calendar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DayPicker
            mode="range"
            selected={
              checkIn && checkOut
                ? { from: checkIn, to: checkOut }
                : checkIn
                ? { from: checkIn, to: checkIn }
                : undefined
            }
            onSelect={(range) => {
              if (range?.from) {
                setCheckIn(range.from);
                setCheckOut(range.to);
                onSelectDates?.(range.from, range.to);
              }
            }}
            disabled={(date) => {
              if (date < new Date()) return true;
              return isDateUnavailable(date);
            }}
            month={currentMonth}
            numberOfMonths={1}
            locale={fr}
            showOutsideDays={false}
            className="pointer-events-auto"
            classNames={{
              months: "flex flex-col",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center mb-4",
              caption_label: "text-base font-semibold",
              nav: "hidden",
              table: "w-full border-collapse",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-12 font-normal text-xs",
              row: "flex w-full mt-2",
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                "w-12 h-12"
              ),
              day: cn(
                "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              ),
              day_range_start: "day-range-start rounded-l-md",
              day_range_end: "day-range-end rounded-r-md",
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground font-semibold",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-30 line-through",
              day_range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
            modifiers={{
              unavailable: allUnavailableDates,
            }}
            modifiersClassNames={{
              unavailable: "line-through text-muted-foreground opacity-30 bg-muted/50",
            }}
            onDayMouseEnter={setHoveredDate}
            onDayMouseLeave={() => setHoveredDate(undefined)}
          />

          <DayPicker
            mode="range"
            selected={
              checkIn && checkOut
                ? { from: checkIn, to: checkOut }
                : checkIn
                ? { from: checkIn, to: checkIn }
                : undefined
            }
            onSelect={(range) => {
              if (range?.from) {
                setCheckIn(range.from);
                setCheckOut(range.to);
                onSelectDates?.(range.from, range.to);
              }
            }}
            disabled={(date) => {
              if (date < new Date()) return true;
              return isDateUnavailable(date);
            }}
            month={addMonths(currentMonth, 1)}
            numberOfMonths={1}
            locale={fr}
            showOutsideDays={false}
            className="pointer-events-auto"
            classNames={{
              months: "flex flex-col",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center mb-4",
              caption_label: "text-base font-semibold",
              nav: "hidden",
              table: "w-full border-collapse",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-12 font-normal text-xs",
              row: "flex w-full mt-2",
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                "w-12 h-12"
              ),
              day: cn(
                "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              ),
              day_range_start: "day-range-start rounded-l-md",
              day_range_end: "day-range-end rounded-r-md",
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground font-semibold",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-30 line-through",
              day_range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
            modifiers={{
              unavailable: allUnavailableDates,
            }}
            modifiersClassNames={{
              unavailable: "line-through text-muted-foreground opacity-30 bg-muted/50",
            }}
            onDayMouseEnter={setHoveredDate}
            onDayMouseLeave={() => setHoveredDate(undefined)}
          />
        </div>
      </div>

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
