import { Button } from "@/components/ui/button";
import type { DatePreset } from "@/lib/date-presets";

interface DatePresetListProps {
  presets: DatePreset[];
  onSelect: (date: Date) => void;
}

export function DatePresetList({ presets, onSelect }: DatePresetListProps) {
  return (
    <div className="flex flex-col gap-1.5 p-3">
      <div className="text-sm font-medium text-muted-foreground px-2">
        Vorschläge
      </div>
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="ghost"
          className="justify-start font-normal text-sm h-auto px-2 py-2"
          onClick={() => {
            if (preset.date) {
              preset.date.setHours(12, 0, 0, 0);
              onSelect(preset.date);
            }
          }}
        >
          <div className="flex flex-col items-start">
            <span>{preset.label}</span>
            {preset.description && (
              <span className="text-xs text-muted-foreground">
                {preset.description}
              </span>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
}