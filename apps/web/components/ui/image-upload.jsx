// File: /components/ui/image-upload.jsx
// Add a prop `inputId` so that you can associate the <label htmlFor="..."> in your form.
import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import Image from "next/image";

export default function ImageUpload({
  onFileSelect,
  className = "",
  initialFiles = [],
  inputId = "fileInput",
}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const allowedTypes = ["image/jpeg", "image/png"];

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFile(initialFiles[0]);
    }
  }, [initialFiles]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    if (file instanceof File) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setPreviewUrl(file);
    }
  }, [file]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      onFileSelect?.([selectedFile]);
    }
  };

  const handleRemoveFile = (event) => {
    event.preventDefault();
    setFile(null);
    onFileSelect?.([]);
  };

  return (
    <div
      className={`flex items-center justify-center border-2 border-dashed rounded-lg p-1 relative ${className}`}
      style={{ width: "350px", height: "350px" }}
    >
      {previewUrl ? (
        <div className="relative w-full h-full">
          <Image
            src={previewUrl}
            alt="Uploaded file"
            fill
            style={{ objectFit: "cover" }}
            className="rounded-lg cursor-pointer"
            onClick={() => document.getElementById(inputId)?.click()}
          />
          <button
            onClick={handleRemoveFile}
            className="absolute top-1 right-1 bg-primary text-card text-xl rounded-full w-7 h-7 hover:bg-primary/75 flex items-center justify-center z-10"
          >
            &times;
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center text-muted-foreground dark:text-accent-foreground cursor-pointer"
          onClick={() => document.getElementById(inputId)?.click()}
        >
          <Upload className="mb-2 w-8 h-8 stroke-border" />
          <button className="px-10 py-2 text-base text-primary/25 font-medium border-2 rounded-md shadow-sm uppercase">
            Browse
          </button>
          <p className="mt-3 text-base text-primary/50 font-medium">
            {"PLEASE UPLOAD YOUR SHOP'S LOGO"}
          </p>
          <p className="text-xs font-light text-primary/35 text-center">
            FILES SUPPORTED: JPEG, PNG, WEBP
          </p>
        </div>
      )}
      <input
        id={inputId}
        type="file"
        accept={allowedTypes.join(",")}
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
}
