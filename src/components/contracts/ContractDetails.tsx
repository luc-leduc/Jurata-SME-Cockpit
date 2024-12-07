import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { TransactionSection } from "@/components/transactions/TransactionSection";
import { ContractPartyCard } from "./ContractPartyCard";
import { ContractGeneralInfo } from "./ContractGeneralInfo";
import { ContractRedFlags } from "./ContractRedFlags";
import { getContractStatus, getSignatureDates } from "./utils";
import type { ContractData } from "@/types/contract";
import type { Receipt } from "@/lib/types";

interface ContractDetailsProps {
  data: ContractData | null;
  receipt: Receipt | null;
  isLoading?: boolean;
  openSections: Set<string>;
  onToggleSection: (section: string) => void;
}

export function ContractDetails({
  data,
  receipt,
  isLoading,
  openSections,
  onToggleSection
}: ContractDetailsProps) {
  const { t } = useTranslation();

  // Get status for each party
  const party1Status = data?.party1 ? getContractStatus(data.party1) : 'pending';
  const party2Status = data?.party2 ? getContractStatus(data.party2) : 'pending';
  
  // Get signature dates and check validity
  const signatureDates = data ? getSignatureDates(data.party1, data.party2) : [];
  const isInvalid = party1Status === 'invalid' || party2Status === 'invalid';
  const isFullySigned = party1Status === 'signed' && party2Status === 'signed';
  
  // Only show loading state during document processing
  const isProcessing = Boolean(receipt?.processing);

  // Check if all required fields are present
  const hasAllFields = Boolean(
    data?.contractType &&
    data?.shortDescription &&
    data?.summary &&
    data?.party1?.name &&
    data?.party2?.name
  );

  // Get overall contract status text
  const getStatusText = () => {
    if (isInvalid) return t('legal.contractAnalysis.details.status.invalid');
    if (isFullySigned) return t('legal.contractAnalysis.details.status.signed');
    if (party1Status === 'pending' && party2Status === 'pending') return t('legal.contractAnalysis.details.status.draft');
    return t('legal.contractAnalysis.details.status.partiallySigned');
  };

  return (
    <div className="space-y-6">
      <TransactionSection
        title={t('legal.contractAnalysis.details.sections.generalInfo.title')}
        isOpen={openSections.has('contract')}
        onToggle={() => onToggleSection('contract')}
        status={{
          isComplete: isFullySigned && hasAllFields,
          isProcessing,
          processingText: t('legal.contractAnalysis.details.processingText'),
          hasAiData: Boolean(data?.contractType),
          summary: data?.contractType ? (
            `${data.contractType}${
              signatureDates[0] ? ` vom ${format(new Date(signatureDates[0]), 'dd.MM.yyyy')}` : ''
            } • ${getStatusText()}`
          ) : t('legal.contractAnalysis.details.notCaptured'),
          variant: isFullySigned ? (hasAllFields ? undefined : 'warning') : 'warning'
        }}
      >
        <ContractGeneralInfo data={data} isLoading={isLoading} receipt={receipt} />
      </TransactionSection>

      <TransactionSection
        title={t('legal.contractAnalysis.details.sections.parties.title')}
        isOpen={openSections.has('parties')}
        onToggle={() => onToggleSection('parties')}
        status={{
          isComplete: Boolean(data?.party1?.name && data?.party2?.name && isFullySigned),
          isProcessing,
          processingText: t('legal.contractAnalysis.details.processingText'),
          hasAiData: Boolean(data?.party1 || data?.party2),
          summary: data?.party1 
            ? `${data.party1.name}${data.party2 ? ` / ${data.party2.name}` : ''}`
            : t('legal.contractAnalysis.details.notCaptured'),
          variant: data?.party1?.name && data?.party2?.name && !isFullySigned ? 'warning' : undefined
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <ContractPartyCard 
            party={data?.party1} 
            label={t('legal.contractAnalysis.details.party.title1')} 
            isLoading={isLoading}
          />
          <ContractPartyCard 
            party={data?.party2} 
            label={t('legal.contractAnalysis.details.party.title2')} 
            isLoading={isLoading}
          />
        </div>
      </TransactionSection>

      <TransactionSection
        title={t('legal.contractAnalysis.details.sections.redFlags.title')}
        isOpen={openSections.has('redFlags')}
        onToggle={() => onToggleSection('redFlags')}
        status={{
          isComplete: Boolean(data?.redFlags?.length),
          isProcessing,
          processingText: t('legal.contractAnalysis.details.processingText'),
          hasAiData: Boolean(data?.redFlags?.length),
          summary: data?.redFlags?.length
            ? `${data.redFlags.length} ${t('legal.contractAnalysis.details.redFlags.found')}`
            : t('legal.contractAnalysis.details.redFlags.notFound'),
          variant: data?.redFlags?.some(flag => flag.rating >= 8) ? 'warning' : undefined
        }}
      >
        <ContractRedFlags data={data} isLoading={isLoading} receipt={receipt} />
      </TransactionSection>
    </div>
  );
}