// components/FileUpload.jsx
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const FileUpload = ({
  onFileSelect,
  onFileRemove,
  maxFiles = 5,
  className = "",
  initialFiles = [],
  disabled = false,
  resetSignal,
}) => {
  const [fileMap, setFileMap] = useState(() => {
    const map = {};
    if (Array.isArray(initialFiles)) {
      initialFiles.forEach((file, index) => {
        const key = `initial-${index}`;
        map[key] = {
          file: file instanceof File ? file : null,
          previewUrl:
            typeof file === "string"
              ? file
              : file instanceof File
              ? URL.createObjectURL(file)
              : null,
          fileName: file instanceof File ? file.name : "",
        };
      });
    }
    return map;
  });

  useEffect(() => {
    const map = {};
    if (Array.isArray(initialFiles)) {
      initialFiles.forEach((file, index) => {
        const key = `initial-${index}`;
        map[key] = {
          file: file instanceof File ? file : null,
          previewUrl:
            typeof file === "string"
              ? file
              : file instanceof File
              ? URL.createObjectURL(file)
              : null,
          fileName: file instanceof File ? file.name : "",
        };
      });
    }
    setFileMap(map);
  }, [resetSignal]);

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  const previewSize = 96;
  const maxFileNameLength = 15;

  const handleFileChange = (event) => {
    if (disabled) return;
    const files = Array.from(event.target.files);
    const availableSlots = maxFiles - Object.keys(fileMap).length;
    const filesToAdd = files.slice(0, availableSlots);
    const newFileMap = { ...fileMap };

    filesToAdd.forEach((file, idx) => {
      const key = `new-${Date.now()}-${idx}`;
      newFileMap[key] = {
        file,
        previewUrl: URL.createObjectURL(file),
        fileName: file.name,
      };
    });

    setFileMap(newFileMap);
    if (onFileSelect) {
      onFileSelect(Object.values(newFileMap).map((item) => item.file));
    }
  };

  const handleRemoveFile = (event, key) => {
    if (disabled) return;
    event.preventDefault();
    const newFileMap = { ...fileMap };
    const removedFileData = newFileMap[key];

    if (removedFileData && !removedFileData.file && removedFileData.previewUrl) {
      if (onFileRemove) {
        onFileRemove(removedFileData.previewUrl);
      }
    }
    if (removedFileData?.file instanceof File && removedFileData.previewUrl) {
      URL.revokeObjectURL(removedFileData.previewUrl);
    }
    delete newFileMap[key];
    setFileMap(newFileMap);
    if (onFileSelect) {
      onFileSelect(Object.values(newFileMap).map((item) => item.file));
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
          {Object.keys(fileMap).map((key) => {
            const fileData = fileMap[key];
            if (!fileData || !fileData.previewUrl) return null;
            const { file, previewUrl, fileName } = fileData;
            const isImage = file
              ? file.type?.startsWith("image/")
              : previewUrl.match(/\.(jpeg|jpg|png|webp)$/i);
            const isPdf = file
              ? file.type === "application/pdf"
              : previewUrl.match(/\.pdf$/i);
            return (
              <div key={key} className="relative flex flex-col items-center w-[96px] h-[96px]">
                <div className="relative min-w-[6rem] min-h-[6rem] max-w-[6rem] max-h-[6rem]">
                  {isImage ? (
                    <Image
                      width={previewSize}
                      height={previewSize}
                      src={previewUrl}
                      alt={fileName}
                      className="object-cover min-w-[6rem] min-h-[6rem] max-w-[6rem] max-h-[6rem] border border-primary/25 border-dashed p-1 rounded-lg"
                    />
                  ) : isPdf ? (
                    <div className="min-w-[6rem] min-h-[6rem] max-w-[6rem] max-h-[6rem] border border-primary/25 border-dashed p-1 rounded-lg">
                      <embed src={previewUrl} type="application/pdf" className="min-w-[5.4rem] min-h-[5.4rem] max-w-[5.4rem] max-h-[5.4rem]" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border border-primary/25 border-dashed p-1 rounded-lg">
                      <FileText className="text-primary w-10 h-10" />
                    </div>
                  )}
                  {!disabled && (
                    <Button
                      variant="none"
                      className="absolute top-1 right-1 shadow-md shadow-pure z-40 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted-foreground"
                      onClick={(e) => handleRemoveFile(e, key)}
                    >
                      <X className="w-4 h-4 stroke-pure" />
                    </Button>
                  )}
                </div>
                <div className="mt-2 w-full">
                  {fileName && (
                    <p className="text-sm font-thin text-primary/85 truncate text-center">
                      {truncateFileName(fileName)}
                    </p>
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
