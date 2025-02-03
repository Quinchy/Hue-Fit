// components/ui/file-upload.jsx
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const FileUpload = ({
  onFileSelect,
  maxFiles = 5,
  className = "",
  initialFiles = [],
  disabled = false,
}) => {
  const [fileMap, setFileMap] = useState({});
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  const previewSize = 96;
  const maxFileNameLength = 15;
  const initialFilesLoaded = useRef(false);

  useEffect(() => {
    if (!initialFilesLoaded.current && initialFiles.length > 0) {
      const updatedFileMap = {};
      initialFiles.forEach((file, index) => {
        const uniqueKey = `file${Date.now()}-${index}`;
        updatedFileMap[uniqueKey] = {
          file: file instanceof File ? file : null,
          previewUrl:
            typeof file === "string"
              ? file
              : file instanceof File
              ? URL.createObjectURL(file)
              : null,
          // Use the file's name if it's a File; if it's a URL, leave it empty.
          fileName: file instanceof File ? file.name : "",
        };
      });
      setFileMap(updatedFileMap);
      initialFilesLoaded.current = true;
    }
  }, [initialFiles]);

  const handleFileChange = async (event) => {
    if (disabled) return;
    const files = Array.from(event.target.files).slice(0, maxFiles - Object.keys(fileMap).length);
    const updatedFileMap = { ...fileMap };

    for (const file of files) {
      const uniqueKey = `file${Date.now()}-${Object.keys(updatedFileMap).length}`;
      if (file.type === "application/pdf") {
        const pdfPreview = await generatePdfPreview(file);
        updatedFileMap[uniqueKey] = { file, previewUrl: pdfPreview, fileName: file.name };
      } else if (file.type.startsWith("image/")) {
        updatedFileMap[uniqueKey] = { file, previewUrl: URL.createObjectURL(file), fileName: file.name };
      }
    }

    setFileMap(updatedFileMap);
    if (onFileSelect) {
      onFileSelect(Object.values(updatedFileMap).map((item) => item.file));
    }
  };

  const handleRemoveFile = (event, fileKey) => {
    if (disabled) return;
    event.preventDefault();
    const updatedFileMap = { ...fileMap };
    delete updatedFileMap[fileKey];
    setFileMap(updatedFileMap);
    if (onFileSelect) {
      onFileSelect(Object.values(updatedFileMap).map((item) => item.file));
    }
  };

  const generatePdfPreview = async (file) => {
    try {
      return URL.createObjectURL(file);
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      return null;
    }
  };

  const truncateFileName = (name) => {
    return name.length > maxFileNameLength ? `${name.substring(0, maxFileNameLength)}...` : name;
  };

  return (
    <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 ${className}`}>
      <div className="flex flex-col items-center justify-center w-full rounded-lg relative pb-10">
        <input
          type="file"
          accept={allowedTypes.join(",")}
          onChange={handleFileChange}
          disabled={disabled || Object.keys(fileMap).length >= maxFiles}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          multiple
        />
        <div className="flex flex-col items-center text-muted-foreground dark:text-accent-foreground">
          <Upload className="mb-2 w-8 h-8 stroke-border" />
          <button className="px-10 py-2 text-base text-primary/25 font-medium border-2 rounded-md shadow-sm uppercase">
            Browse
          </button>
          <p className="mt-3 text-base text-primary/50 font-medium">UPLOAD YOUR FILES HERE</p>
          <p className="text-xs font-light text-primary/35 text-center">
            FILES SUPPORTED: JPEG, PNG, WEBP, & PDF <br />
            THE MAX FILE SIZE IS 20 MB PER FILE AND MAXIMUM OF {maxFiles} FILES
          </p>
        </div>
        <p className="mt-5 mb-2 text-primary/50 font-medium">Uploaded Files:</p>
        <div className="flex flex-wrap gap-10 h-full justify-center">
          {Object.keys(fileMap).map((fileKey) => {
            const fileData = fileMap[fileKey];
            if (!fileData || !fileData.previewUrl) return null;
            const { file, previewUrl, fileName } = fileData;
            const isImage = file
              ? file.type?.startsWith("image/")
              : previewUrl.match(/\.(jpeg|jpg|png|webp)$/i);
            const isPdf = file
              ? file.type === "application/pdf"
              : previewUrl.match(/\.pdf$/i);
            return (
              <div key={fileKey} className="flex flex-col items-center w-[96px] h-[96px]">
                {isImage ? (
                  <Image
                    width={previewSize}
                    height={previewSize}
                    src={previewUrl}
                    alt={fileName}
                    className="object-cover w-full h-full border border-primary/25 border-dashed p-1 rounded-lg"
                  />
                ) : isPdf ? (
                  <div className="w-full h-full border border-primary/25 border-dashed p-1 rounded-lg">
                    <embed src={previewUrl} type="application/pdf" className="w-full h-full" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center border border-primary/25 border-dashed p-1 rounded-lg">
                    <FileText className="text-primary w-10 h-10" />
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 w-full">
                  {fileName && (
                    <p className="text-sm font-thin text-primary/85 truncate w-3/4">
                      {truncateFileName(fileName)}
                    </p>
                  )}
                  {!disabled && (
                    <Button
                      variant="none"
                      className="z-40 scale-115 hover:bg-accent w-7 h-7 rounded-full"
                      onClick={(e) => handleRemoveFile(e, fileKey)}
                    >
                      <X />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.forwardRef((props, ref) => <FileUpload {...props} ref={ref} />);
