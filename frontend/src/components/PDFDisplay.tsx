"use client";
import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

type PDFDisplayProps = {
  pdfUrl: string;
};

const PDFDisplay: React.FC<PDFDisplayProps> = ({ pdfUrl }) => {
  return (
    <div className="pdf-container">
      <Worker workerUrl={window.location.origin+"/pdf.worker.min.mjs"}>
        <div style={{ height: '750px' }}>
          <Viewer fileUrl={pdfUrl} />
        </div>
      </Worker>
    </div>
  );
};

export default PDFDisplay;