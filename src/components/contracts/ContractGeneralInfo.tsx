import { Receipt } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { getContractStatus, getSignatureDates } from "./utils";
import type { ContractData } from "@/types/contract";

interface ContractGeneralInfoProps {
  data: ContractData | null;
  isLoading?: boolean;
  receipt: Receipt | null;
}

export function ContractGeneralInfo({ data, isLoading, receipt }: ContractGeneralInfoProps) {
  const { t } = useTranslation();

  const getOverallStatus = () => {
    if (!data?.party1 || !data?.party2) return t('legal.contractAnalysis.details.party.notRecognized');

    const party1Status = getContractStatus(data.party1);
    const party2Status = getContractStatus(data.party2);

    if (party1Status === 'invalid' || party2Status === 'invalid') {
      return t('legal.contractAnalysis.details.status.invalid');
    }

    if (party1Status === 'signed' && party2Status === 'signed') {
      return t('legal.contractAnalysis.details.status.signed');
    }
    if (party1Status === 'pending' && party2Status === 'pending') {
      return t('legal.contractAnalysis.details.status.draft');
    }
    return t('legal.contractAnalysis.details.status.partiallySigned');
  };

  const formatSignatureDates = () => {
    if (!data) return t('legal.contractAnalysis.details.party.notRecognized');
    
    const dates = getSignatureDates(data.party1, data.party2);
    if (dates.length === 0) return t('legal.contractAnalysis.details.party.notRecognized');
    
    return dates
      .map(date => format(new Date(date), 'dd.MM.yyyy'))
      .join(', ');
  };

  // Only show skeleton during active processing
  const showSkeleton = Boolean(isLoading && receipt?.processing);
  
  if (showSkeleton) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.type')}</div>
            <Skeleton className="h-4 w-40" />
          </div>
          <div>
            <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.status')}</div>
            <Skeleton className="h-4 w-32" />
          </div>
          <div>
            <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.startDate')}</div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div>
            <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.endDate')}</div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.description')}</div>
          <Skeleton className="h-4 w-full" />
        </div>
        <div>
          <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.summary')}</div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.type')}</div>
          <div className="text-sm text-muted-foreground">
            {data?.contractType || t('legal.contractAnalysis.details.party.notRecognized')}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.status')}</div>
          <div className="text-sm text-muted-foreground">{getOverallStatus()}</div>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.startDate')}</div>
          <div className="text-sm text-muted-foreground">
            {data?.startDate ? format(new Date(data.startDate), 'dd.MM.yyyy') : t('legal.contractAnalysis.details.party.notRecognized')}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.endDate')}</div>
          <div className="text-sm text-muted-foreground">
            {data?.endDate ? format(new Date(data.endDate), 'dd.MM.yyyy') : t('legal.contractAnalysis.details.party.notRecognized')}
          </div>
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.description')}</div>
        <div className="text-sm text-muted-foreground">
          {data?.shortDescription || t('legal.contractAnalysis.details.party.notRecognized')}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-1">{t('legal.contractAnalysis.details.sections.generalInfo.summary')}</div>
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {data?.summary || t('legal.contractAnalysis.details.party.notRecognized')}
        </div>
      </div>
    </div>
  );
}