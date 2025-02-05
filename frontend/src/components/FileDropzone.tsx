"use client";

import { useDropzone } from "react-dropzone";
import { FC, useState } from "react";
import { FileText, Image as ImageIcon, File as GenericFileIcon } from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import { FaRegFileVideo } from "react-icons/fa";
// Define the props type for the FileDropzone component
interface FileDropzoneProps {
    onDrop: (acceptedFiles: File[]) => void; // Callback for handling dropped files
    accept?: { [mimeType: string]: string[] }; // MIME types to accept
    label?: string; // Label text for the dropzone
    className?: string; // Additional CSS class names
}

// FileDropzone Component
export const FileDropzone: FC<FileDropzoneProps> = ({
                                                        onDrop,
                                                        accept = {},
                                                        label = "Drop files here or click to select",
                                                        className = "",
                                                    }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // State to store the selected file

    // Use the `useDropzone` hook with the provided configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setSelectedFile(acceptedFiles[0]); // Update the selected file state
                onDrop(acceptedFiles); // Call the parent callback
            }
        },
        accept, // Accepted file types
        maxFiles: 1, // Allow only one file at a time
    });

    // Function to determine the file icon based on the file type
    const getFileIcon = (file: File) => {
        const mimeType = file.type;

        if (mimeType.includes("pdf")) {
            return <FaFilePdf className="w-6 h-6 mr-2 text-red-500" />;
        } else if (mimeType.includes("image")) {
            return <ImageIcon className="w-6 h-6 mr-2 text-blue-500" />;
        }
        else if (mimeType.includes("video")) {
            return <FaRegFileVideo className="w-6 h-6 mr-2 text-purple-500" />; // Video file icon
        }
        else if (mimeType.includes("text") || mimeType.includes("application/msword")) {
            return <FileText className="w-6 h-6 mr-2 text-green-500" />;
        } else {
            return <GenericFileIcon className="w-6 h-6 mr-2 text-gray-500" />;
        }
    };

    return (
        <div
            {...getRootProps()} // Spread root props from `useDropzone`
            className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"}
                ${className} // Add any additional classes
            `}
        >
            <input {...getInputProps()} /> {/* Input element for file selection */}

            {/* Display the selected file */}
            {selectedFile ? (
                <div className="flex items-center justify-center">
                    {getFileIcon(selectedFile)} {/* Show the file icon */}
                    <span className="text-sm text-gray-700">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </span>
                </div>
            ) : (
                <p className="text-sm text-gray-600">{label}</p>
                )}
        </div>
    );
};