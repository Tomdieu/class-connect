"use client";
import React, { useEffect, useState } from "react";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import {
  toolbarPlugin,
  ToolbarProps,
  type ToolbarSlot,
  type TransformToolbarSlot,
} from "@react-pdf-viewer/toolbar";
import { pageNavigationPlugin, PageChangeEvent } from "@react-pdf-viewer/page-navigation";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

type PDFDisplayProps = {
  pdfUrl: string;
  onProgressUpdate?: (currentPage: number, totalPages: number, progressPercentage: number) => void;
  initialPage?: number;
};

const PDFDisplay: React.FC<PDFDisplayProps> = ({ 
  pdfUrl, 
  onProgressUpdate,
  initialPage = 0 
}) => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Create the page navigation plugin
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  // Use the jumpToPage function when initialPage is set
  useEffect(() => {
    if (initialPage > 0 && jumpToPage) {
      // Need to wait a bit for the PDF to load
      const timer = setTimeout(() => {
        jumpToPage(initialPage - 1); // PDF viewer uses 0-indexed pages
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [initialPage, jumpToPage]);

  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Download: () => <></>,
    DownloadMenuItem: () => <></>,
    EnterFullScreen: () => <></>,
    EnterFullScreenMenuItem: () => <></>,
    SwitchTheme: () => <></>,
    SwitchThemeMenuItem: () => <></>,
    Print: () => <></>,
    Open: () => <></>
  });

  const renderToolbar = (Toolbar: (props: ToolbarProps) => React.ReactElement) => 
    <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>;
    
  // Add page navigation plugin to defaultLayoutPlugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs: (defaultTabs) => [],
  });
  
  const { renderDefaultToolbar } = defaultLayoutPluginInstance.toolbarPluginInstance;

  // Handle page change events
  const handlePageChange = (e: PageChangeEvent) => {
    const newPage = e.currentPage + 1; // Convert from 0-indexed to 1-indexed
    setCurrentPage(newPage);

    if (onProgressUpdate && totalPages > 0) {
      const progress = Math.round((newPage / totalPages) * 100);
      onProgressUpdate(newPage, totalPages, progress);
    }
  };

  // Handle document loaded event to get total pages
  const handleDocumentLoad = (e: any) => {
    if (e && e.doc) {
      const numPages = e.doc.numPages;
      setTotalPages(numPages);
    }
  };

  return (
    <div className="pdf-container">
      <Worker workerUrl={window.location.origin + "/pdf.worker.min.js"}>
        <div style={{ height: "750px" }}>
          <Viewer 
            fileUrl={pdfUrl} 
            plugins={[
              defaultLayoutPluginInstance, 
              pageNavigationPluginInstance
            ]}
            onPageChange={handlePageChange}
            onDocumentLoad={handleDocumentLoad}
          />
        </div>
      </Worker>
    </div>
  );
};

export default PDFDisplay;
