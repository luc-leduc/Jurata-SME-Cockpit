import { useState } from "react";
import { cn } from "@/lib/utils";
import { Receipt } from "@/lib/types";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { ReceiptPreview } from "@/components/transactions/ReceiptPreview";

interface DocumentUploadProps {
  receipt: Receipt | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploadText: string;
  processingText?: string;
  className?: string;
}

export function DocumentUpload({ 
  receipt, 
  onUpload, 
  onRemove, 
  uploadText,
  processingText = "Dokument wird von Jurata AI analysiert",
  className 
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  if (receipt) {
    return (
      <div className={cn("relative h-full", className)}>
        {receipt.processing && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">{processingText}</span>
              </div>
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        )}
        <ReceiptPreview
          file={receipt.file}
          preview={receipt.preview}
          onRemove={onRemove}
        />
        {receipt.error && (
          <div className="mt-2 p-4 text-sm text-red-500 bg-red-50/50 rounded-lg border">
            {receipt.error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border-2 border-dashed p-8 transition-colors h-full",
        dragActive ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25",
        "relative flex flex-col items-center justify-center gap-2 text-center",
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {uploadText}
      </p>
      <input
        type="file"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
        accept="image/*,.pdf"
      />
    </div>
  );
}