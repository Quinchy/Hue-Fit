import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const FileUpload = ({ onFileSelect, maxFiles = 5, className = "", initialFiles = [] }) => {
  const [fileMap, setFileMap] = useState({});
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  const previewSize = 96; // Set a fixed square size for all previews
  const maxFileNameLength = 15; // Maximum characters to display in file name

  useEffect(() => {
    const updatedFileMap = {};
    initialFiles.forEach((file, index) => {
      const uniqueKey = `file${Date.now()}-${index}`;
      if (file instanceof File) {
        updatedFileMap[uniqueKey] = { file, previewUrl: URL.createObjectURL(file) };
      } else if (typeof file === "string") {
        updatedFileMap[uniqueKey] = { file: null, previewUrl: file }; // If it's a URL, treat it as a string
      }
    });
    setFileMap(updatedFileMap);
  }, [initialFiles]);

  const setInitialFiles = (files) => {
    const updatedFileMap = {};
    files.forEach((file, index) => {
      const uniqueKey = `file${Date.now()}-${index}`;
      updatedFileMap[uniqueKey] = {
        file: file instanceof File ? file : null,
        previewUrl: file instanceof File ? URL.createObjectURL(file) : file,
      };
    });
    setFileMap(updatedFileMap);
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files).slice(0, maxFiles - Object.keys(fileMap).length);
    const updatedFileMap = { ...fileMap };

    for (const file of files) {
      const uniqueKey = `file${Date.now()}-${Object.keys(updatedFileMap).length}`;
      if (file.type === "application/pdf") {
        const pdfPreview = await generatePdfPreview(file);
        updatedFileMap[uniqueKey] = { file, previewUrl: pdfPreview };
      } else if (file.type.startsWith("image/")) {
        updatedFileMap[uniqueKey] = { file, previewUrl: URL.createObjectURL(file) };
      }
    }

    setFileMap(updatedFileMap);

    if (onFileSelect) {
      onFileSelect(Object.values(updatedFileMap).map((item) => item.file));
    }
  };

  const handleRemoveFile = (event, fileKey) => {
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
      const pdfBlob = URL.createObjectURL(file);
      return pdfBlob;
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      return null;
    }
  };

  const truncateFileName = (name) => {
    if (name.length > maxFileNameLength) {
      return `${name.substring(0, maxFileNameLength)}...`;
    }
    return name;
  };

  return (
    <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 ${className}`}>
      <div className="flex flex-col items-center justify-center w-full rounded-lg relative pb-10">
        <input
          type="file"
          accept={allowedTypes.join(",")}
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={Object.keys(fileMap).length >= maxFiles}
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
            if (!fileData || !fileData.file) {
              return null;
            }
            const { file, previewUrl } = fileData;
            const isImage = file.type?.startsWith("image/");
            const isPdf = file.type === "application/pdf";

            return (
              <div
                className="flex flex-col items-center w-[96px] h-[96px]"
                key={fileKey}
              >
                {isImage ? (
                  <Image
                    width={previewSize}
                    height={previewSize}
                    src={previewUrl}
                    alt={file.name}
                    className="min-w-[7rem] min-h-[7rem] max-w-[7rem] max-h-[7rem] object-cover border border-primary/25 border-dashed p-1 rounded-lg"
                  />
                ) : isPdf ? (
                  <embed
                    src={previewUrl}
                    type="application/pdf"
                    className="min-w-[7rem] min-h-[7rem] max-w-[7rem] max-h-[7rem] object-cover border border-primary/25 border-dashed p-1 rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="text-primary w-10 h-10" />
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 w-full">
                  <p className="text-sm font-thin text-primary/85 truncate w-3/4">
                    {file.name}
                  </p>
                  <Button
                    variant="none"
                    className="z-40 scale-115 hover:bg-accent w-7 h-7 rounded-full"
                    onClick={(e) => handleRemoveFile(e, fileKey)}
                  >
                    <X />
                  </Button>
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
