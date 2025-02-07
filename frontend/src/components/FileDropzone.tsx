"use client";
import { useDropzone } from "react-dropzone";
import { FC, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  File as GenericFileIcon,
} from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import { FaRegFileVideo } from "react-icons/fa";

interface FileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  accept?: { [mimeType: string]: string[] };
  label?: string;
  className?: string;
}

export const FileDropzone: FC<FileDropzoneProps> = ({
  onDrop,
  accept = {},
  label = "Drop files here or click to select",
  className = "",
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        onDrop(acceptedFiles);
      }
    },
    accept,
    maxFiles: 1,
  });

  const getFileIcon = (file: File) => {
    const mimeType = file.type;
    if (mimeType.includes("pdf")) {
      return <FaFilePdf className="size-6 text-red-500" />;
    } else if (mimeType.includes("image")) {
      return <ImageIcon className="size-6 text-blue-500" />;
    } else if (mimeType.includes("video")) {
      return <FaRegFileVideo className="size-6 text-purple-500" />;
    } else if (
      mimeType.includes("text") ||
      mimeType.includes("application/msword")
    ) {
      return <FileText className="size-6 text-green-500" />;
    } else {
      return <GenericFileIcon className="size-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Function to truncate filename if it's too long
  const getTruncatedFilename = (filename: string, maxLength: number = 40): string => {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    
    const truncatedLength = maxLength - (extension?.length || 0) - 3; // Account for "..." and "."
    return `${nameWithoutExt.substring(0, truncatedLength)}...${extension ? `.${extension}` : ''}`;
  };

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors
        ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      {selectedFile ? (
        <div className="flex items-start space-x-3 overflow-hidden">
          <div className="flex-shrink-0 mt-1">
            {getFileIcon(selectedFile)}
          </div>
          <div className="min-w-0 flex-1">
            <div 
              className="text-sm text-gray-700 break-all line-clamp-2" 
              title={selectedFile.name}
            >
              {getTruncatedFilename(selectedFile.name)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatFileSize(selectedFile.size)}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">{label}</p>
      )}
    </div>
  );
};