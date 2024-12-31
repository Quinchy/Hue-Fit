import React, { useState, useEffect } from "react";
import { Upload } from 'lucide-react';
import Image from "next/image";

const ImageUpload = ({ onFileSelect, className = "", initialFiles = [] }) => {
  const [file, setFile] = useState(null);
  const allowedTypes = ["image/jpeg", "image/png"];

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFile(initialFiles[0]);
    }
  }, [initialFiles]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);

      if (onFileSelect) {
        onFileSelect([selectedFile]);
      }
    }
  };

  const handleRemoveFile = (event) => {
    event.preventDefault();
    setFile(null);

    if (onFileSelect) {
      onFileSelect([]);
    }
  };

  const getImageSrc = () => {
    if (!file) return null;

    return file instanceof File ? URL.createObjectURL(file) : file;
  };

  return (
    <div
      className={`flex items-center justify-center border-2 border-dashed rounded-lg p-1 relative ${className}`}
      style={{ width: '350px', height: '350px' }}
    >
      {file ? (
        <div className="relative w-full h-full">
          <Image
            src={getImageSrc()}
            alt="Uploaded file"
            layout="fill"
            objectFit="cover"
            className="rounded-lg cursor-pointer "
            onClick={() => document.getElementById('fileInput').click()}
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
          onClick={() => document.getElementById('fileInput').click()}
        >
          <Upload className="mb-2 w-8 h-8 stroke-border" />
          <button className="px-10 py-2 text-base text-primary/25 font-medium border-2 rounded-md shadow-sm uppercase">
            Browse
          </button>
          <p className="mt-3 text-base text-primary/50 font-medium">{"PLEASE UPLOAD YOUR SHOP'S LOGO"}</p>
          <p className="text-xs font-light text-primary/35 text-center">
            FILES SUPPORTED: JPEG, PNG, WEBP
          </p>
        </div>
      )}
      <input
        id="fileInput"
        type="file"
        accept={allowedTypes.join(",")}
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={!!file}
      />
    </div>
  );
};

export default ImageUpload;