import { useState, useCallback } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { presets } from "./date-range-presets";

interface DateRangePickerProps {
  date: DateRange;
  onSelect: (date: DateRange) => void;
}

export function DateRangePicker({ date, onSelect }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<DateRange | undefined>(date);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      // Initialize selection with the current date range
      setSelection(date);
    }
  };

  const handleDayClick = useCallback(
    (day: Date) => {
      if (selection?.from && selection?.to) {
        // Reset the selection and start a new range
        setSelection({ from: day, to: undefined });
      } else if (selection?.from && !selection?.to) {
        // Set the end date
        let newSelection = { from: selection.from, to: day };

        // Ensure from date is before to date
        if (newSelection.to && newSelection.from > newSelection.to) {
          [newSelection.from, newSelection.to] = [
            newSelection.to,
            newSelection.from,
          ];
        }

        // Set time to noon for consistency
        newSelection.from.setHours(12, 0, 0, 0);
        newSelection.to?.setHours(12, 0, 0, 0);

        setSelection(newSelection);
        onSelect(newSelection);
      } else {
        // Set the start date
        setSelection({ from: day, to: undefined });
      }
    },
    [selection, onSelect]
  );

  const handlePresetClick = (range: DateRange) => {
    // Set time to noon for preset dates
    if (range.from) {
      range.from.setHours(12, 0, 0, 0);
    }
    if (range.to) {
      range.to.setHours(12, 0, 0, 0);
    }
    onSelect(range);
    setSelection(range);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date?.from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "d. MMMM yyyy", { locale: de })} –{" "}
                {format(date.to, "d. MMMM yyyy", { locale: de })}
              </>
            ) : (
              format(date.from, "d. MMMM yyyy", { locale: de })
            )
          ) : (
            <span>Zeitraum wählen</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto p-0" align="start">
        <div className="flex flex-col gap-1.5 p-3 border-r w-[180px]">
          <div className="text-sm font-medium text-muted-foreground px-2">
            Vorschläge
          </div>
          {presets.map((preset) => (
            <Button
              key={preset.label}
              onClick={() => handlePresetClick(preset.value)}
              variant="ghost"
              className="justify-start font-normal text-sm h-8 px-2"
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="p-2">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selection?.from || undefined}
            selected={selection}
            // Remove onSelect to prevent internal state management
            onDayClick={handleDayClick}
            numberOfMonths={2}
            locale={de}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}