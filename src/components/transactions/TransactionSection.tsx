import * as React from 'react';
import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Sparkles, ChevronRight } from 'lucide-react';

interface TransactionSectionProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  status: {
    isComplete: boolean;
    isProcessing?: boolean;
    processingText?: string;
    hasAiData?: boolean;
    summary?: string;
    variant?: 'warning';
  };
  className?: string;
}

// Handle auto-opening of sections
function useAutoOpen(isProcessing: boolean | undefined, isOpen: boolean, onToggle: () => void, wasProcessing: React.MutableRefObject<boolean>) {
  useEffect(() => {
    // Only open when processing starts and section is closed
    if (isProcessing && !wasProcessing.current && !isOpen) {
      onToggle();
    }
    wasProcessing.current = Boolean(isProcessing);
  }, [isProcessing, onToggle, wasProcessing, isOpen]);
}

const sectionVariants = {
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  }
};

export function TransactionSection({
  title,
  children,
  isOpen,
  onToggle,
  status,
  className
}: TransactionSectionProps) {
  // Keep track of previous processing state
  const wasProcessing = React.useRef(false);

  useAutoOpen(status.isProcessing, isOpen, onToggle, wasProcessing);

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("rounded-lg border bg-card text-card-foreground", className)}>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-4 px-4 py-3",
            "select-none",
            "transition-colors hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "rounded-t-lg"
          )}
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </motion.div>
          <span className="text-sm font-medium">{title}</span>

          <div className="flex items-center gap-2 text-sm font-normal ml-auto">
            {status.summary && (
              <>
                {(status.isProcessing || status.hasAiData) && (
                  <Sparkles className={cn(
                    "h-3 w-3",
                    status.isProcessing ? "text-primary" : "text-muted-foreground"
                  )} />
                )}
                <span className="text-muted-foreground">
                  {status.isProcessing ? status.processingText : status.summary}
                </span>
              </>
            )}
            <motion.span
              className={cn(
                "h-2 w-2 shrink-0 aspect-square rounded-full",
                status.isProcessing && "bg-blue-500",
                !status.isProcessing && status.isComplete && !status.variant && "bg-green-500",
                !status.isProcessing && status.isComplete && status.variant === 'warning' && "bg-orange-500",
                !status.isProcessing && !status.isComplete && "bg-yellow-500"
              )}
              animate={status.isProcessing ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={status.isProcessing ? { 
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              } : {}}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sectionVariants}
              className="border-t overflow-hidden"
            >
              <div className="px-4 py-4">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}