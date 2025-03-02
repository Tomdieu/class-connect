"use client";
import React from "react";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import {
  toolbarPlugin,
  ToolbarProps,
  type ToolbarSlot,
  type TransformToolbarSlot,
} from "@react-pdf-viewer/toolbar";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

type PDFDisplayProps = {
  pdfUrl: string;
};

const PDFDisplay: React.FC<PDFDisplayProps> = ({ pdfUrl }) => {
  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Download: () => <></>,
    DownloadMenuItem: () => <></>,
    EnterFullScreen: () => <></>,
    EnterFullScreenMenuItem: () => <></>,
    SwitchTheme: () => <></>,
    SwitchThemeMenuItem: () => <></>,
    Print:()=><></>,
    Open:()=><></>
  });

  const renderToolbar = (
    Toolbar: (props: ToolbarProps) => React.ReactElement
  ) => <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>;
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
  });
  const { renderDefaultToolbar } =
    defaultLayoutPluginInstance.toolbarPluginInstance;

  // const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="pdf-container">
      <Worker
        // workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js"
        // workerUrl="https://unpkg.com/pdfjs-dist@2.15.349/build/pdf.worker.js"
        workerUrl={window.location.origin + "/pdf.worker.min.js"}
      >
        <div style={{ height: "750px" }}>
          <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
        </div>
      </Worker>
    </div>
  );
};

export default PDFDisplay;
