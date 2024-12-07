import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ContractManagement() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{t('legal.contractManagement.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('legal.contractManagement.description')}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          {t('legal.contractManagement.comingSoon')}
        </p>
      </div>
    </div>
  );
}