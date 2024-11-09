import * as React from "react";
import { useState } from "react";
import { Upload } from 'lucide-react';
import { ErrorMessage } from "@/components/ui/error-message";

const FileUpload = ({ onFileSelect, maxSizeMB = 20 }) => {
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState(""); // State to store file name
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Only allow one file

    // Reset error state
    setError('');
    setFileName('');

    if (file) {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        setError('Unsupported file type. Only JPEG, PNG, WEBP, and PDF are allowed.');
        return;
      }

      // Check file size (in MB)
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`File too large. Max size is ${maxSizeMB}MB.`);
        return;
      }

      // If valid, set file name and pass file to parent handler
      setFileName(file.name);
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-lg p-5">
      <div className="flex flex-col items-center justify-center h-[12rem] w-full rounded-lg relative">
        <input
          type="file"
          accept={allowedTypes.join(",")}
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center text-muted-foreground dark:text-accent-foreground">
          <Upload className="mb-2 w-8 h-8 stroke-primary/50" />
          <button className="px-4 py-2 text-base text-primary/65 font-semibold border-2 rounded-md shadow-sm uppercase">
            Browse
          </button>
          <p className="mt-3 text-base text-primary/50 font-medium">UPLOAD YOUR BUSINESS LICENSE HERE</p>
          <p className="text-xs font-light text-primary/35 text-center">
            FILES SUPPORTED: JPEG, PNG, WEBP, & PDF <br />
            THE MAX FILE SIZE IS {maxSizeMB}MB
          </p>
        </div>
        {fileName && (
          <p className="mt-2 text-primary text-sm font-semibold">
            Selected File: {fileName}
          </p>
        )}
      </div>
      {error && <ErrorMessage message={error} className="mt-2" />}
    </div>
  );
};

export default FileUpload;
