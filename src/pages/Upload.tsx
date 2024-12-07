import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import type { Receipt } from "@/lib/types";

export function Upload() {
  const { t } = useTranslation();
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const handleUpload = async (file: File) => {
    try {
      const preview = URL.createObjectURL(file);
      setReceipt({ file, preview, processing: true });

      // TODO: Implement actual file upload logic here
      await new Promise(resolve => setTimeout(resolve, 1000));

      setReceipt(prev => prev ? {
        ...prev,
        processing: false
      } : null);

      toast.success(t('common:toasts.uploadSuccess'));
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : t('common:errors.uploadFailed');
      
      setReceipt(prev => prev ? {
        ...prev,
        processing: false,
        error: errorMessage
      } : null);

      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{t('navigation.documentsSection.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('common:documents.uploadDescription')}
        </p>
      </div>

      <DocumentUpload
        receipt={receipt}
        onUpload={handleUpload}
        uploadText={t('navigation.documentsSection.uploadDocument')}
        processingText={t('common:documents.processingDocument')}
        onRemove={() => {
          if (receipt?.preview) {
            URL.revokeObjectURL(receipt.preview);
          }
          setReceipt(null);
        }}
        className="min-h-[400px]"
      />
    </div>
  );
}