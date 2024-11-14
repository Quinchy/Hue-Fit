import * as React from "react";
import { useState } from "react";
import { Upload, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabaseClient"; // Import your supabase client

const FileUpload = ({ onFileSelect, maxFiles = 5, className = "" }) => {
  const [fileMap, setFileMap] = useState({}); // Use an object to store files with unique keys
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  const [uploading, setUploading] = useState(false); // Track upload state

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files).slice(0, maxFiles - Object.keys(fileMap).length);
    const updatedFileMap = { ...fileMap };
    const uploadedUrls = [];

    setUploading(true);

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const uniqueKey = `file${Date.now()}-${index}`; // Generate a unique key for each file

      try {
        const { data, error } = await uploadFileToSupabase(file);
        if (error) throw error;

        // Log the data object to inspect it
        console.log("Supabase upload response data:", data);

        // Store the file URL in state and push the URL to uploadedUrls
        if (data && data.publicURL) {
          updatedFileMap[uniqueKey] = { file, url: data.publicURL };
          uploadedUrls.push(data.publicURL);
          console.log(`Uploaded file URL: ${data.publicURL}`); // Log the URL after the file is uploaded
        } else {
          console.error("No public URL returned for file:", file.name);
        }
      } catch (error) {
        console.error("Error uploading file:", error.message);
      }
    }

    setFileMap(updatedFileMap);
    setUploading(false);

    // Pass the uploaded file URLs to the parent component
    if (onFileSelect) onFileSelect(uploadedUrls);
  };

  const uploadFileToSupabase = async (file) => {
    const fileBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from('business-licenses') // Your Supabase bucket
      .upload(`licenses/${file.name}`, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
  
    if (error) {
      console.error("Error uploading file:", error.message);
      return { error };
    }
  
    // Generate the public URL manually
    const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-licenses/${data.path}`;
  
    return { data: { ...data, publicURL }, error: null };
  };
  
  const handleRemoveFile = async (event, fileKey) => {
    event.preventDefault();
  
    const fileToRemove = fileMap[fileKey];
    console.log("Removing file:", fileToRemove.file.name);
  
    // Remove the file from fileMap
    const updatedFileMap = { ...fileMap };
    delete updatedFileMap[fileKey];
    setFileMap(updatedFileMap);
  
    const filePathToRemove = `licenses/${fileToRemove.file.name}`;  // Use the path to the file stored in Supabase
    
    // Log the file path to ensure it's correct
    console.log("Deleting file from Supabase at path:", filePathToRemove);
  
    // Remove the file from Supabase storage
    try {
      const { error } = await supabase.storage
        .from('business-licenses')
        .remove([filePathToRemove]);
  
      if (error) {
        console.error("Error removing file from Supabase:", error.message);
      } else {
        console.log("File removed from Supabase successfully.");
      }
    } catch (error) {
      console.error("Error during file removal:", error);
    }
  
    if (onFileSelect) {
      onFileSelect(Object.values(updatedFileMap).map(f => f.url)); // Update parent with the remaining URLs
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
          <Upload className="mb-2 w-8 h-8 stroke-primary/50" />
          <button className="px-4 py-2 text-base text-primary/65 font-semibold border-2 rounded-md shadow-sm uppercase">
            Browse
          </button>
          <p className="mt-3 text-base text-primary/50 font-medium">UPLOAD YOUR BUSINESS LICENSES HERE</p>
          <p className="text-xs font-light text-primary/35 text-center">
            FILES SUPPORTED: JPEG, PNG, WEBP, & PDF <br />
            THE MAX FILE SIZE IS 20 MB PER FILE <br />
            MAX {maxFiles} FILES
          </p>
        </div>
        <p className="mt-5 mb-2 text-primary/50 font-medium">Selected Files:</p>
        {Object.keys(fileMap).map((fileKey) => (
          <div className="flex flex-row items-center gap-2" key={fileKey}>
            <p className="font-thin text-primary/85">{fileMap[fileKey].file.name}</p>
            <Button variant="none" className="z-40 scale-125 hover:bg-accent p-1 h-5" onClick={(e) => handleRemoveFile(e, fileKey)}>
              <X />
            </Button>
          </div>
        ))}
        {uploading && <p className="text-sm text-primary/50">Uploading...</p>}
      </div>
    </div>
  );
};

export default FileUpload;
