import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { CustomResizeHandle } from "@/components/ui/custom-resize-handle";
import { ContractUpload } from "@/components/contracts/ContractUpload";
import { ContractDetails } from "@/components/contracts/ContractDetails";
import { analyzeContract } from "@/lib/services/contracts";
import { toast } from "sonner";
import type { ContractData } from "@/types/contract";
import type { Receipt } from "@/lib/types";

export function ContractAnalysis() {
  const { t } = useTranslation();
  
  // State management
  const [extractedData, setExtractedData] = useState<ContractData | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // Event handlers
  const handleUpload = async (file: File) => {
    try {
      const preview = URL.createObjectURL(file);
      setIsLoading(true);
      setReceipt({ 
        file, 
        preview, 
        processing: true
      });

      const result = await analyzeContract(file);
      
      if (!result.isContract) {
        throw new Error(t('legal.contractAnalysis.notAContract'));
      }

      setExtractedData(result);
      setReceipt(prev => prev ? { ...prev, processing: false } : null);
      setIsLoading(false);
      toast.success(t('legal.contractAnalysis.uploadSuccess'));
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : t('legal.contractAnalysis.uploadError');
      setExtractedData(null);
      setReceipt(prev => prev ? {
        ...prev,
        processing: false,
        error: errorMessage
      } : null);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    if (receipt?.preview) {
      URL.revokeObjectURL(receipt.preview);
    }
    setReceipt(null);
    setExtractedData(null);
  };

  const handleToggleSection = (section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{t('legal.contractAnalysis.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('legal.contractAnalysis.description')}
        </p>
      </div>

      <div className="-mx-6 h-[calc(100vh-14rem)]">
        <ResizablePanelGroup direction="horizontal" className="h-full relative">
          <ResizablePanel defaultSize={50} minSize={30} maxSize={70} className="h-full">
            <div className="h-full overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <ContractDetails 
                isLoading={isLoading}
                data={extractedData}
                receipt={receipt}
                openSections={openSections}
                onToggleSection={handleToggleSection}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle>
            <CustomResizeHandle />
          </ResizableHandle>

          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <div className="h-full p-6">
              <ContractUpload
                receipt={receipt} 
                onUpload={handleUpload} 
                onRemove={handleRemove} 
                className="h-full" 
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}