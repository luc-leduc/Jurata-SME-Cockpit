import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlertTriangle, Building2, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ContractData } from "@/types/contract";
import type { Receipt } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface ContractRedFlagsProps {
  data: ContractData | null;
  isLoading?: boolean;
  receipt: Receipt | null;
}

interface RedFlagItemProps {
  text: string;
  explanation: string;
  rating: number;
  context?: string;
}

function RedFlagItem({ text, explanation, rating, context }: RedFlagItemProps) {
  return (
    <div className="space-y-2 p-4 rounded-lg bg-muted/50">
      <div className="flex items-start gap-2">
        <AlertTriangle className={cn(
          "h-4 w-4 mt-1 shrink-0",
          rating >= 8 ? "text-red-500" :
          rating >= 5 ? "text-orange-500" :
          "text-yellow-500"
        )} />
        <div className="space-y-1 flex-1">
          <div className="font-medium">{text}</div>
          {context && (
            <div className="text-sm text-muted-foreground italic">
              Kontext: {context}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {explanation}
          </div>
        </div>
        <div className={cn(
          "text-sm font-medium tabular-nums",
          rating >= 8 ? "text-red-500" :
          rating >= 5 ? "text-orange-500" :
          "text-yellow-500"
        )}>
          {rating}/10
        </div>
      </div>
    </div>
  );
}

function getPartyName(party?: ContractParty) {
  if (!party) return 'Nicht erkannt';
  return party.name || (
    party.type === 'company' ? 'Unternehmen' : 'Privatperson'
  );
}

export function ContractRedFlags({ data, isLoading, receipt }: ContractRedFlagsProps) {
  const { t } = useTranslation();
  const [selectedParty, setSelectedParty] = useState<string>("party1");
  
  // Only show skeleton during active processing
  const showSkeleton = Boolean(isLoading && receipt?.processing);

  const redFlags = selectedParty === "party1" ? data?.redFlagsParty1 : data?.redFlagsParty2;
  const currentParty = selectedParty === "party1" ? data?.party1 : data?.party2;
  const partyName = getPartyName(currentParty);

  if (showSkeleton) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-5 w-16 shrink-0" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const switchLabel = `Aus Sicht von ${getPartyName(data?.party1)} | ${getPartyName(data?.party2)}`;

  if (!redFlags?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        {t('legal.contractAnalysis.details.sections.redFlags.noIssues')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 mb-6">
        <ToggleGroup 
          type="single" 
          value={selectedParty} 
          onValueChange={(value) => value && setSelectedParty(value)}
          className="justify-center"
        >
          <ToggleGroupItem value="party1" aria-label="Analyse aus Sicht von Partei 1" className="flex items-center gap-2">
            {data?.party1?.type === 'company' ? (
              <Building2 className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span>{getPartyName(data?.party1)}</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="party2" aria-label="Analyse aus Sicht von Partei 2" className="flex items-center gap-2">
            {data?.party2?.type === 'company' ? (
              <Building2 className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span>{getPartyName(data?.party2)}</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {(() => {
        const sortedFlags = [...redFlags].sort((a, b) => b.rating - a.rating);
        
        const severe = sortedFlags.filter(flag => flag.rating >= 8);
        const critical = sortedFlags.filter(flag => flag.rating >= 5 && flag.rating < 8);
        const potential = sortedFlags.filter(flag => flag.rating < 5);

        return (
          <div className="space-y-6">
            {severe.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  {t('legal.contractAnalysis.details.sections.redFlags.severity.high')}
                </h4>
                <div className="space-y-2">
                  {severe.map((flag, index) => (
                    <RedFlagItem key={index} {...flag} />
                  ))}
                </div>
              </div>
            )}

            {critical.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-orange-500 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  {t('legal.contractAnalysis.details.sections.redFlags.severity.medium')}
                </h4>
                <div className="space-y-2">
                  {critical.map((flag, index) => (
                    <RedFlagItem key={index} {...flag} />
                  ))}
                </div>
              </div>
            )}

            {potential.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-yellow-500 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  {t('legal.contractAnalysis.details.sections.redFlags.severity.low')}
                </h4>
                <div className="space-y-2">
                  {potential.map((flag, index) => (
                    <RedFlagItem key={index} {...flag} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}