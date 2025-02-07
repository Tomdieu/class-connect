"use client"
import PDFDisplay from "@/components/PDFDisplay";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { useViewPDFStore } from "@/hooks/view-pdf-store";
import { DocumentViewer } from 'react-documents';
export function PDFDialog() {
  const { isOpen, setIsOpen, pdfUrl,setPdfUrl } = useViewPDFStore();
  console.log({isOpen, pdfUrl})

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogTitle>
          <VisuallyHidden>PDF Viewer</VisuallyHidden>
        </DialogTitle>
        {pdfUrl && (
          <DocumentViewer viewerUrl={'https://docs.google.com/gview?url=%URL%&embedded=true'} viewer="url" url={pdfUrl}/>
        )}
        {/* {pdfUrl && <PDFDisplay pdfUrl={pdfUrl} />} */}
      </DialogContent>
    </Dialog>
  );
}
