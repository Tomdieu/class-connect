"use client"
import PDFDisplay from "@/components/PDFDisplay";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { useViewPDFStore } from "@/hooks/view-pdf-store";

export function PDFDialog() {
  const { isOpen, setIsOpen, pdfUrl } = useViewPDFStore();
  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogTitle>
          <VisuallyHidden>PDF Viewer</VisuallyHidden>
        </DialogTitle>
        {pdfUrl && <PDFDisplay pdfUrl={pdfUrl} />}
      </DialogContent>
    </Dialog>
  );
}
