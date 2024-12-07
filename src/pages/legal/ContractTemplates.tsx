import { FilePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ContractTemplates() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{t('legal.contractTemplates.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('legal.contractTemplates.description')}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <FilePlus className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          {t('legal.contractTemplates.comingSoon')}
        </p>
      </div>
    </div>
  );
}