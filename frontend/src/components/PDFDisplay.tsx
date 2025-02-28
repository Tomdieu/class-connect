"use client";
import React from "react";
// import { Worker, Viewer } from "@react-pdf-viewer/core";
// import "@react-pdf-viewer/core/lib/styles/index.css";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

type PDFDisplayProps = {
  pdfUrl: string;
};

const PDFDisplay: React.FC<PDFDisplayProps> = ({ pdfUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="pdf-container">
      <Worker
        workerUrl="https://unpkg.com/pdfjs-dist@2.15.349/build/pdf.worker.js"
        // workerUrl={window.location.origin+"/pdf.worker.min.mjs"}
      >
        <div style={{ height: "750px" }}>
          <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
        </div>
      </Worker>
    </div>
  );
};

export default PDFDisplay;
