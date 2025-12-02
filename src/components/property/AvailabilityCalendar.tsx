import { useState, useRef, TouchEvent } from "react";
import { DayPicker } from "react-day-picker";
import { addDays, isSameDay, isWithinInterval, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import "react-day-picker/dist/style.css";

interface AvailabilityCalendarProps {
  bookedDates?: Date[];
  blockedDates?: Date[];
  onSelectDates?: (checkIn: Date | undefined, checkOut: Date | undefined) => void;
  // Controlled mode props
  selectedCheckIn?: Date;
  selectedCheckOut?: Date;
  // Guest info for display
  adults?: number;
  children?: number;
}

export const AvailabilityCalendar = ({ 
  bookedDates = [],
  blockedDates = [],
  onSelectDates,
  selectedCheckIn,
  selectedCheckOut,
  adults,
  children
}: AvailabilityCalendarProps) => {
  // Use internal state only if not controlled
  const [internalCheckIn, setInternalCheckIn] = useState<Date>();
  const [internalCheckOut, setInternalCheckOut] = useState<Date>();
  
  // Use controlled values if provided, otherwise use internal state
  const checkIn = selectedCheckIn !== undefined ? selectedCheckIn : internalCheckIn;
  const checkOut = selectedCheckOut !== undefined ? selectedCheckOut : internalCheckOut;
  const [hoveredDate, setHoveredDate] = useState<Date>();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const isMobile = useIsMobile();
  
  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

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

  const onTouchStart = (e: TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNextMonth();
    } else if (isRightSwipe) {
      goToPreviousMonth();
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      // Update internal state only if not controlled
      if (selectedCheckIn === undefined) {
        setInternalCheckIn(range.from);
        setInternalCheckOut(range.to);
      }
      onSelectDates?.(range.from, range.to);
    }
  };

  return (
    <div className="space-y-6">
      {!checkIn && !checkOut && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            Choisissez la période du séjour pour avoir des prix plus précis
          </p>
        </div>
      )}

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
          {isMobile && (
            <p className="text-xs text-muted-foreground">
              Glissez pour naviguer
            </p>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Container with Swipe Support */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={cn(
            "grid gap-8 select-none",
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          )}
        >
          <DayPicker
            mode="range"
            selected={
              checkIn && checkOut
                ? { from: checkIn, to: checkOut }
                : checkIn
                ? { from: checkIn, to: checkIn }
                : undefined
            }
            onSelect={handleSelect}
            disabled={(date) => {
              if (date < new Date()) return true;
              return isDateUnavailable(date);
            }}
            month={currentMonth}
            numberOfMonths={1}
            locale={fr}
            showOutsideDays={false}
            className="pointer-events-auto w-full"
            classNames={{
              months: "flex flex-col",
              month: "space-y-4 w-full",
              caption: "flex justify-center pt-1 relative items-center mb-4",
              caption_label: "text-base font-semibold",
              nav: "hidden",
              table: "w-full border-collapse",
              head_row: "flex w-full",
              head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-xs",
              row: "flex w-full mt-2",
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                "flex-1 aspect-square"
              ),
              day: cn(
                "w-full h-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors flex items-center justify-center"
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

          {!isMobile && (
            <DayPicker
              mode="range"
              selected={
                checkIn && checkOut
                  ? { from: checkIn, to: checkOut }
                  : checkIn
                  ? { from: checkIn, to: checkIn }
                  : undefined
              }
              onSelect={handleSelect}
              disabled={(date) => {
                if (date < new Date()) return true;
                return isDateUnavailable(date);
              }}
              month={addMonths(currentMonth, 1)}
              numberOfMonths={1}
              locale={fr}
              showOutsideDays={false}
              className="pointer-events-auto w-full"
              classNames={{
                months: "flex flex-col",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-base font-semibold",
                nav: "hidden",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-xs",
                row: "flex w-full mt-2",
                cell: cn(
                  "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                  "flex-1 aspect-square"
                ),
                day: cn(
                  "w-full h-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors flex items-center justify-center"
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
          )}
        </div>
      </div>

      {checkIn && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
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
            {(adults !== undefined || children !== undefined) && (
              <div>
                <p className="font-medium mb-2">Voyageurs:</p>
                <p className="text-sm">
                  {adults || 0} adulte{(adults || 0) > 1 ? "s" : ""}
                  {children && children > 0 && `, ${children} enfant${children > 1 ? "s" : ""}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
