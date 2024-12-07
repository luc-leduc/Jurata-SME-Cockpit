import { Users2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Signatory } from "@/types/contract";
import { Skeleton } from "@/components/ui/skeleton";

interface ContractSignatoriesProps {
  signatories: Signatory[];
  isLoading?: boolean;
}

export function ContractSignatories({ signatories, isLoading }: ContractSignatoriesProps) {
  if (!signatories?.length) return null;

  return (
    <div className="space-y-1 mt-2 border-t pt-2">
      {isLoading ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Skeleton className="h-3 w-3 shrink-0" />
          <span>Unterzeichnet von</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users2 className="h-3 w-3" />
          <span>Unterzeichnet von</span>
        </div>
      )}
      {isLoading ? (
        <div className="space-y-2">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ) : (
        signatories.map((signatory, index) => (
        <div key={index} className="space-y-0.5 text-[13px]">
          <div className="font-medium">
            {[signatory.firstName, signatory.lastName].filter(Boolean).join(' ')}
          </div>
          {signatory.role && (
            <div className="text-xs text-muted-foreground">
              {signatory.role}
            </div>
          )}
        </div>
        ))
      )}
    </div>
  );
}