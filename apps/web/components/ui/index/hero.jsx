"use client";

import LetterSwapPingPong from "@/components/fancy/letter-swap-pingpong-anim";
import { Gloock } from "next/font/google";
import { ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";
import ScrambleHover from "@/components/fancy/scramble-hover";
import routes from "@/routes";
import ShrinkingImage from "@/components/ui/shrinking-image";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

export default function Hero() {
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleWindowMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    return () => window.removeEventListener("mousemove", handleWindowMouseMove);
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/HueFit-ver1.0.0.apk"; // Ensure the APK is in your public folder
    link.download = "HueFit.apk"; // Optional: specify the default filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Array of image paths
  const imagePaths = [
    "/images/floating-image-0.png",
    "/images/floating-image-1.png",
    "/images/floating-image-2.png",
    "/images/floating-image-3.png",
    "/images/floating-image-4.png",
    "/images/floating-image-5.png",
    "/images/floating-image-6.png",
    "/images/floating-image-7.png",
    "/images/floating-image-8.png",
    "/images/floating-image-9.png",
  ];

  // Total number of grid cells
  const cellCount = 30;

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="absolute -top-[25rem] w-screen overflow-hidden"
      >
        {/* Smooth radial gradient overlay following the cursor with a smoother light spread */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10 transition-all duration-300"
          style={{
            background:
              "radial-gradient(circle 200px at var(--cursor-x) var(--cursor-y), rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 90%)",
          }}
          animate={{
            "--cursor-x": `${cursorPos.x}px`,
            "--cursor-y": `${cursorPos.y}px`,
          }}
          transition={{ type: "tween", duration: 0.3 }}
        />
        <div className="relative w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: cellCount }, (_, i) => (
            <div key={i} className="relative aspect-square">
              {i % 4 !== 0 && (
                <ShrinkingImage
                  src={imagePaths[i % imagePaths.length]}
                  alt={`Background image ${i}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hero Content */}
      <div className="flex flex-col items-center gap-6">
        <h1
          className={`z-10 text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-primary text-center select-none ${gloock.className}`}
        >
          <ScrambleHover
            text={"DISCOVER"}
            scrambleSpeed={50}
            maxIterations={8}
            useOriginalCharsOnly={true}
            className="cursor-pointer"
          />
          <br />
          <p className="bg-[linear-gradient(90deg,_var(--rainbow1)_15%,_var(--rainbow2)_20%,_var(--rainbow3)_30%,_var(--rainbow4)_40%,_var(--rainbow5)_55%,_var(--rainbow6)_90%)] bg-clip-text text-transparent">
            <ScrambleHover
              text={"YOUR STYLE"}
              scrambleSpeed={50}
              maxIterations={8}
              useOriginalCharsOnly={true}
              className="cursor-pointer whitespace-nowrap"
            />
          </p>
        </h1>
        <p className="z-10 uppercase text-balance text-sm lg:text-xl tracking-wide text-primary/80 text-center max-w-sm sm:max-w-md md:max-w-xl lg:max-w-4xl xl:max-w-4xl">
          HueFit is a modern {"men's"} apparel shopping platform that leverages
          advanced technology to help you find the perfect outfit.
        </p>
        <div className="flex flex-col xl:flex-row items-center gap-4 mt-4">
          <button
            onClick={handleDownload}
            className="flex flex-row items-center justify-center bg-primary border-primary border min-w-44 lg:min-w-48 py-3 lg:py-4 z-20"
          >
            <p className="uppercase text-pure font-medium lg:font-bold text-sm text-center">
              <LetterSwapPingPong label="Download HueFit" staggerFrom="last" />
            </p>
            <Download
              className="mb-[1px] stroke-[3px] stroke-pure ml-1"
              width={13}
              height={13}
            />
          </button>
          <div className="z-20">
            <Link
              className="flex flex-row items-center justify-center min-w-44 lg:min-w-48 py-3 lg:py-4 ring-primary ring-[1px]"
              href={routes.partnership}
            >
              <p className="uppercase lg:font-bold text-sm text-center">
                <LetterSwapPingPong
                  label="Partner With Us"
                  staggerFrom="last"
                />
              </p>
              <ArrowUpRight
                className="mb-[1px] stroke-[3px] ml-1"
                width={15}
                height={15}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
