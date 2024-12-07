import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DatePresetList } from "./date-picker-presets";
import type { DatePreset } from "@/lib/date-presets";

interface DatePickerProps {
  date: Date;
  onSelect: (date: Date) => void;
  presets?: DatePreset[];
}

export function DatePicker({ date, onSelect, presets }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(date, "PPP", { locale: de })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto p-0" align="start">
        {presets && <DatePresetList presets={presets} onSelect={onSelect} />}
        <div className="border-l">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                newDate.setHours(12, 0, 0, 0);
                onSelect(newDate);
              }
            }}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}