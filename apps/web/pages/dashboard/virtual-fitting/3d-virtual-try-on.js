// pages/3d-virtual-try-on.js
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle } from "@/components/ui/card";

// Dynamically import ARViewer with SSR disabled to prevent "window is not defined" errors
const ARViewer = dynamic(() => import("@/components/ui/ar-viewer"), {
  ssr: false,
});

export default function VirtualTryOn3DPage() {
  // State to store the uploaded file's information
  const [uploadedFile, setUploadedFile] = useState(null);
  const [modelURL, setModelURL] = useState(null);
  const [modelType, setModelType] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Reference to the file input for resetting
  const fileInputRef = useRef(null);

  // Define allowed file extensions
  const allowedExtensions = ["glb", "gltf", "obj", "fbx"]; // Added obj and fbx

  // Helper function to extract file extension
  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  // Handler for file input changes
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const extension = getFileExtension(file.name);
      const isExtensionValid = allowedExtensions.includes(extension);

      console.log("Uploaded File:", {
        name: file.name,
        type: file.type,
        extension: extension,
        isExtensionValid: isExtensionValid,
      });

      if (!isExtensionValid) {
        setError("Unsupported file type. Please upload a .glb, .gltf, .obj, or .fbx file.");
        setUploadedFile(null);
        setModelURL(null);
        setModelType(null);
        return;
      }

      setIsLoading(true); // Start loading

      // Create a URL for the uploaded file
      const url = URL.createObjectURL(file);
      setUploadedFile({
        name: file.name,
        type: file.type,
        extension: extension,
      });
      setModelURL(url);
      setModelType(extension);
      setError("");
      setIsLoading(false); // End loading
    } else {
      setUploadedFile(null);
      setModelURL(null);
      setModelType(null);
      setError("");
    }
  };

  // Reset handler
  const handleReset = () => {
    setUploadedFile(null);
    setModelURL(null);
    setModelType(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (modelURL && modelURL.startsWith("blob:")) {
        URL.revokeObjectURL(modelURL);
      }
    };
  }, [modelURL]);

  return (
    <DashboardLayoutWrapper>
      <CardTitle className="text-4xl">3D Virtual Fitting Room</CardTitle>

      {/* File Upload Input */}
      <div>
        <label htmlFor="file-upload" className="block text-base font-medium">
          Upload 3D Model File (.glb, .gltf, .obj, or .fbx)
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".glb, .gltf, .obj, .fbx" // Updated accepted file types
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block w-1/3 text-sm border-2 rounded border-border border-dashed p-3"
        />
      </div>

      {/* Display Error Message */}
      {error && (
        <div className=" text-red-600">
          {error}
        </div>
      )}

      {/* Display Loading Indicator */}
      {isLoading && (
        <div className=" text-blue-600">
          Loading 3D Model...
        </div>
      )}

      {/* Display Uploaded File Information */}
      {uploadedFile && (
        <div className="rounded">
          <p>
            <strong>Filename:</strong> {uploadedFile.name}
          </p>
          <p>
            <strong>File Type:</strong> {uploadedFile.type || "N/A"}
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Reset
          </button>
        </div>
      )}

      {/* 3D Renderer */}
      {modelURL && modelType && (
        <div className="h-96">
          <ARViewer modelURL={modelURL} modelType={modelType} />
        </div>
      )}
    </DashboardLayoutWrapper>
  );
}
