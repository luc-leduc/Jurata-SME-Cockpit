import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface DatePreset {
  label: string;
  description: string;
  date: Date;
}

interface DatePickerWithPresetsProps {
  date: Date;
  onSelect: (date: Date) => void;
  presets: DatePreset[];
  triggerClassName?: string;
}

export function DatePickerWithPresets({
  date,
  onSelect,
  presets,
  triggerClassName
}: DatePickerWithPresetsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            triggerClassName
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(date, "PPP", { locale: de })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="w-[280px] border-r">
            <div className="px-4 py-[0.6875rem] text-sm font-medium text-muted-foreground">
              Vorschläge
            </div>
            <div className="px-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 font-normal text-left mb-2 hover:bg-accent"
                  onClick={() => {
                    preset.date.setHours(12, 0, 0, 0);
                    onSelect(preset.date);
                  }}
                >
                  <div>
                    <div className="text-sm font-medium leading-none mb-1">{preset.label}</div>
                    <div className="text-xs text-muted-foreground">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
          <div className="p-3">
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
        </div>
      </PopoverContent>
    </Popover>
  );
}