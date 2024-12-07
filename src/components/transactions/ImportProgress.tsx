import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImportProgressProps {
  processed: number;
  total: number;
}

export function ImportProgress({ processed, total }: ImportProgressProps) {
  const progress = total > 0 ? (processed / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <Progress 
        value={progress}
        className="h-2" 
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {`${processed} von ${total} Buchungen importiert (${Math.floor(progress)}%)`}
        </span>
      </div>
    </div>
  );
}