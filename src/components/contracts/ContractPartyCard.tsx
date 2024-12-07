import { Building2, User, Users2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractStatus } from "./ContractStatus";
import { getContractStatus } from "./utils";
import { ContractSignatories } from "./ContractSignatories";
import type { ContractParty } from "@/types/contract";

interface ContractPartyProps {
  party?: ContractParty;
  label: string;
  isLoading?: boolean;
}

export function ContractPartyCard({ party, label, isLoading }: ContractPartyProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="relative bg-blue-50/50 dark:bg-blue-950/10 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <span>{label}</span>
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-40" />
          <div className="space-y-2 mt-3 pt-3 border-t">
            <div className="flex items-center gap-1.5">
              <Users2 className="h-3 w-3 text-muted-foreground" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="relative bg-blue-50/50 dark:bg-blue-950/10 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm font-medium mb-3">
          <span>{label}</span>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.party.name')}</div>
            <div className="text-sm text-muted-foreground">{t('legal.contractAnalysis.details.party.notRecognized')}</div>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.party.address')}</div>
            <div className="text-sm text-muted-foreground">{t('legal.contractAnalysis.details.party.notRecognized')}</div>
          </div>
        </div>
      </div>
    );
  }

  const status = getContractStatus(party);

  return (
    <div className="relative bg-blue-50/50 dark:bg-blue-950/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>{label}</span>
          {party.type === 'individual' ? (
            <User className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Building2 className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <ContractStatus status={status} />
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.party.name')}</div>
          <div className="text-sm text-muted-foreground">{party.name}</div>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.party.address')}</div>
          <div className="text-sm text-muted-foreground">{party.address || t('legal.contractAnalysis.details.party.notRecognized')}</div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <ContractSignatories
            signatures={party.signatures}
            noSignatureText={t('legal.contractAnalysis.details.party.noSignature')}
            signedByText={t('legal.contractAnalysis.details.party.signedBy')}
            signedOnText={t('legal.contractAnalysis.details.party.signedOn')}
          />
        </div>
      </div>
    </div>
  );
}