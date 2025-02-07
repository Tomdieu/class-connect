"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Document, Page,pdfjs } from "react-pdf";
import { Maximize2, Minimize2 } from "lucide-react";

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Ensure the PDF worker is loaded
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const PDFViewer = dynamic(() => import("react-pdf").then((mod) => mod.Document), {
  ssr: false,
  loading: () => <p>Loading PDF...</p>,
});

type PDFDisplayProps = {
  pdfUrl: string;
};

const PDFDisplay: React.FC<PDFDisplayProps> = ({ pdfUrl }) => {
  // const [pageNumber, setPageNumber] = useState(1);
  // const [numPages, setNumPages] = useState<number | null>(null);

  // const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
  //   setNumPages(numPages);
  // };

  // const nextPage = () => {
  //   if (numPages && pageNumber < numPages) {
  //     setPageNumber(pageNumber + 1);
  //   }
  // };

  // const prevPage = () => {
  //   if (pageNumber > 1) {
  //     setPageNumber(pageNumber - 1);
  //   }
  // };

  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [pageNumber, setPageNumber] = React.useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onChangePage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPageNumber = parseInt(e.target.value, 10);
    if (newPageNumber >= 1 && newPageNumber <= numPages!) {
      setPageNumber(newPageNumber);
    }
  };

  return (
    <div>
      <h2>PDF Viewer</h2>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <div>
        <p>
          Page {pageNumber} of {numPages}
        </p>
        <input
          type="number"
          value={pageNumber}
          onChange={onChangePage}
          min={1}
        />
      </div>
    </div>
  );


  return (
    <div className={`flex flex-col justify-center items-center w-full h-screen`}>
      
      {/* <PDFViewer file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page 
          pageNumber={pageNumber} 
         
        />
      </PDFViewer>

      <div className="flex gap-4 mt-4">
        <button 
          onClick={prevPage} 
          disabled={pageNumber <= 1} 
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {pageNumber} of {numPages || "?"}
        </span>
        <button 
          onClick={nextPage} 
          disabled={numPages !== null && pageNumber >= numPages} 
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div> */}
    </div>
  );
};

export default PDFDisplay;