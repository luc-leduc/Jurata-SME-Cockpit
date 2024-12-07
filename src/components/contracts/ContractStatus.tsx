import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

type StatusType = 'signed' | 'pending' | 'partial' | 'invalid' | null;

interface ContractStatusProps {
  status: StatusType;
  className?: string;
}

export function ContractStatus({ status, className }: ContractStatusProps) {
  const { t } = useTranslation();
  
  if (!status) return null;

  switch (status) {
    case 'signed':
      return (
        <Badge 
          variant="outline" 
          className="text-[10px] px-1.5 py-0 h-4 bg-green-100 text-green-700 border-green-200"
        >
          <CheckCircle className="mr-1 h-2.5 w-2.5" />
          {t('legal.contractAnalysis.details.status.signed')}
        </Badge>
      );
    case 'pending':
      return (
        <Badge 
          variant="outline" 
          className="text-[10px] px-1.5 py-0 h-4 bg-orange-100 text-orange-700 border-orange-200"
        >
          <Clock className="mr-1 h-2.5 w-2.5" />
          {t('legal.contractAnalysis.details.status.draft')}
        </Badge>
      );
    case 'invalid':
      return (
        <Badge 
          variant="outline" 
          className="text-[10px] px-1.5 py-0 h-4 bg-red-100 text-red-700 border-red-200"
        >
          <Clock className="mr-1 h-2.5 w-2.5" />
          {t('legal.contractAnalysis.details.status.invalid')}
        </Badge>
      );
    default:
      return null;
  }
}