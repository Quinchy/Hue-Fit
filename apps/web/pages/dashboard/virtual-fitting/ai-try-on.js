// pages/ai-try-on.js

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, CheckCircle2, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useRouter } from "next/router";

export default function AiTryOn() {
  const router = useRouter();
  const { pngClotheURL, type } = router.query;

  const [modelFile, setModelFile] = useState(null);
  const [mode, setMode] = useState('balanced');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/png") {
      setModelFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!modelFile) {
      alert("Please upload a model PNG file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("model", modelFile);
    formData.append("pngClotheURL", pngClotheURL);
    formData.append("type", type);
    formData.append("mode", mode);

    try {
      const response = await fetch("/api/fashn/try-on", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setResultImage(data.resultImage);
        setShowAlert(true);
      } else {
        alert("Try-On failed: " + data.error);
      }
    } catch (error) {
      console.error("Error during try-on:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = type === "LOWERWEAR" ? "Bottom" : "Top";

  // Define mode options
  const modes = [
    { label: "Performance", value: "performance" },
    { label: "Balanced", value: "balanced" },
    { label: "Quality", value: "quality" },
  ];

  return (
    <DashboardLayoutWrapper>
      {showAlert && (
        <Alert className="flex flex-row items-center fixed z-50 w-[30rem] right-14 bottom-12 shadow-lg rounded-lg p-4">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">
              Try-On Successful
            </AlertTitle>
            <AlertDescription className="text-green-300">
              The AI try-on has been completed successfully.
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            className="ml-auto p-2"
            onClick={() => setShowAlert(false)}
          >
            <X className="scale-150 stroke-primary/50 -translate-x-2"/>
          </Button>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <CardTitle className="text-4xl">AI Try-On</CardTitle>
      </div>

      <Card className="flex flex-col gap-5 p-5">
        {/* First Row: Garment, Model Uploading & Preview, Result */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Garment */}
          <div className="flex flex-col items-center w-full">
            <h2 className="text-lg font-medium mb-2">Garment</h2>
            <div className="relative w-full h-full border-2 border-dashed rounded-lg overflow-hidden">
              {pngClotheURL ? (
                <Image
                  src={pngClotheURL}
                  alt="Garment"
                  layout="fill" // Makes the image fill the parent container
                  objectFit="contain" // Ensures the image covers the area without distortion
                  className="rounded-lg p-5"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-border-300">
                  <span className="text-muted">No Garment Selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Model Uploading & Preview */}
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-medium mb-2">Model</h2>
            
            <div className="relative w-full h-full">
              {modelFile && (
                <Image
                  src={URL.createObjectURL(modelFile)}
                  alt="Model Preview"
                  layout="fill" // Ensures the image covers the parent container
                  objectFit="cover" // Adjusts how the image fits
                  className="absolute inset-0 p-5 object-cover z-20"
                />
              )}
              
              <label className="relative border-2 border-dashed p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer w-full h-full z-10">
                <Upload className="stroke-primary/50 mb-2" />
                <span className="text-primary/50 font-thin">
                  {modelFile ? "Model file selected" : "Upload model PNG"}
                </span>
                <input
                  type="file"
                  accept="image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          {/* Column 3: Result */}
          <div className="flex flex-col items-center w-full">
            <h2 className="text-lg font-medium mb-2">Result</h2>
            <div className="relative w-full h-full pb-[100%] rounded-lg overflow-hidden">
              {resultImage ? (
                <Image
                  src={resultImage}
                  alt="AI Try-On Result"
                  layout="fill" // Makes the image fill the parent container
                  objectFit="cover" // Ensures the image covers the area without distortion
                  className="rounded-sm"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-border-300">
                  <span className="text-primary/25">No Result Yet</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Second Row: Generate Button and Mode Selection */}
        <div className="flex flex-col gap-2 items-end">
          {/* Generate Button */}
          <Button onClick={handleSubmit} disabled={loading} className="w-[30rem]">
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Try-on"}
          </Button>
          {/* Mode Selection */}
          <div className="flex flex-row gap-2">
            {modes.map((m) => (
              <Button
                key={m.value}
                variant={mode === m.value ? "default" : "outline"}
                onClick={() => setMode(m.value)}
                className="uppercase w-[9.65rem]"
              >
                {m.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
