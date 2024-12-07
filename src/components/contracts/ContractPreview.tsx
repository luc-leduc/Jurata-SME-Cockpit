import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Position {
  x: number;
  y: number;
}

interface ContractPreviewProps {
  file: File;
  preview: string;
  onRemove: () => void;
  className?: string;
}

export function ContractPreview({ file, preview, onRemove, className }: ContractPreviewProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPDF = file.type === 'application/pdf';

  // Calculate initial scale to fit content
  useEffect(() => {
    const calculateInitialScale = () => {
      if (!containerRef.current || !contentRef.current) return;

      const container = containerRef.current;
      const content = contentRef.current;

      const containerWidth = container.clientWidth - 64;
      const containerHeight = container.clientHeight - 64;
      const contentWidth = content.scrollWidth;
      const contentHeight = content.scrollHeight;

      const scaleX = containerWidth / contentWidth;
      const scaleY = containerHeight / contentHeight;
      const newScale = Math.min(scaleX, scaleY, 1);

      setScale(newScale);
    };

    calculateInitialScale();

    const observer = new ResizeObserver(calculateInitialScale);
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (scale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    if (containerRef.current) {
      const container = containerRef.current;
      const contentWidth = container.scrollWidth * scale;
      const contentHeight = container.scrollHeight * scale;
      const maxX = (contentWidth - container.clientWidth) / 2;
      const maxY = (contentHeight - container.clientHeight) / 2;

      setPosition({
        x: Math.max(Math.min(newX, maxX), -maxX),
        y: Math.max(Math.min(newY, maxY), -maxY)
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const previewStyle = {
    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
    transformOrigin: 'center center',
    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
    transition: isDragging ? 'none' : 'transform 0.2s',
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none' as const
  };

  return (
    <div className={cn(
      "relative rounded-lg border bg-background p-4 flex flex-col overflow-hidden h-full",
      className
    )}>
      <div className="absolute right-2 top-2 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border bg-background"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border bg-background"
          onClick={handleZoomIn}
          disabled={scale >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border bg-background text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden p-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div ref={contentRef} style={previewStyle}>
          {isPDF ? (
            <Document
              file={file}
              onLoadSuccess={handleDocumentLoadSuccess} 
              className="w-full h-full flex items-center justify-center"
            >
              <Page
                pageNumber={pageNumber}
                width={containerRef.current?.clientWidth ? containerRef.current.clientWidth - 32 : 400}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg select-none max-h-full"
              />
            </Document>
          ) : (
            <img
              src={preview}
              alt="Contract preview"
              className="w-full h-full object-contain shadow-lg select-none"
            />
          )}
        </div>
      </div>

      {isPDF && numPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {pageNumber} / {numPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}