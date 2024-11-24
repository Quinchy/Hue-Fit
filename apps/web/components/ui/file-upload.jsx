// file-upload.jsx
import * as React from "react";
import { useState, useEffect } from "react";
import { Upload, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const FileUpload = ({ onFileSelect, maxFiles = 5, className = "", initialFiles = [] }) => {
  const [fileMap, setFileMap] = useState({}); // Use an object to store files with unique keys
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

  useEffect(() => {
    const updatedFileMap = {};
    initialFiles.forEach((file, index) => {
      const uniqueKey = `file${Date.now()}-${index}`;
      updatedFileMap[uniqueKey] = file;
    });
    setFileMap(updatedFileMap);
  }, [initialFiles]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).slice(0, maxFiles - Object.keys(fileMap).length);
    const updatedFileMap = { ...fileMap };

    files.forEach((file, index) => {
      const uniqueKey = `file${Date.now()}-${index}`; // Generate a unique key for each file
      updatedFileMap[uniqueKey] = file;
    });

    setFileMap(updatedFileMap);

    if (onFileSelect) {
      onFileSelect(Object.values(updatedFileMap)); // Pass the selected files to parent
    }
  };

  const handleRemoveFile = (event, fileKey) => {
    event.preventDefault();

    const updatedFileMap = { ...fileMap };
    delete updatedFileMap[fileKey];
    setFileMap(updatedFileMap);

    if (onFileSelect) {
      onFileSelect(Object.values(updatedFileMap)); // Update parent with the remaining files
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 ${className}`}>
      <div className="flex flex-col items-center justify-center h-fit w-full rounded-lg relative">
        <input
          type="file"
          accept={allowedTypes.join(",")}
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          multiple
        />
        <div className="flex flex-col items-center text-muted-foreground dark:text-accent-foreground">
          <Upload className="mb-2 w-8 h-8 stroke-border" />
          <button className="px-10 py-2 text-base text-primary/25 font-medium border-2 rounded-md shadow-sm uppercase">
            Browse
          </button>
          <p className="mt-3 text-base text-primary/50 font-medium">UPLOAD YOUR BUSINESS LICENSES HERE</p>
          <p className="text-xs font-light text-primary/35 text-center">
            FILES SUPPORTED: JPEG, PNG, WEBP, & PDF <br />
            THE MAX FILE SIZE IS 20 MB PER FILE AND MAXIMUM OF {maxFiles} FILES
          </p>
        </div>
        <p className="mt-5 mb-2 text-primary/50 font-medium">Uploaded Files:</p>
        <div className="flex flex-wrap gap-5 justify-center">
          {Object.keys(fileMap).map((fileKey) => (
            <div className="flex flex-row items-center" key={fileKey}>
              <p className="font-thin text-primary/85">{fileMap[fileKey].name}</p>
              <Button variant="none" className="z-40 scale-125 hover:bg-accent p-1 h-5" onClick={(e) => handleRemoveFile(e, fileKey)}>
                <X />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
