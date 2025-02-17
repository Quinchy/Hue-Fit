"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { Button } from "@/components/ui/button";
import { Gloock } from "next/font/google";
import { ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import Floating, { FloatingElement } from "@/components/fancy/parallax-floating";
import ScrambleHover from "@/components/fancy/scramble-hover";
import Image from "next/image";
import routes from "@/routes";

// Create a motion-enabled Next.js Image component
const MotionImage = motion(Image);

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

export default function Hero() {
  const [scope, animate] = useAnimate();
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/HueFit-ver1.0.0.apk"; // Ensure the APK is in your public folder
    link.download = "HueFit.apk"; // Optional: specify the default filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    animate("img", { opacity: [0, 1] }, { duration: 0.5, delay: stagger(0.15) });
  }, [animate]);

  return (
    <div className="relative" ref={scope}>
      {/* Absolutely Positioned Floating Background with Motion */}
      <div className="absolute inset-0 overflow-visible">
        <Floating sensitivity={-1}>
          {/* Floating Elements for Images 1 to 12 */}
          <FloatingElement depth={0.5} className="top-[-45%] left-[-10%] opacity-25">
            <motion.div className="h-[8rem] w-[8rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
              <MotionImage
                src="/images/floating-image-0.png"
                fill
                quality={100}
                className="object-cover"
                alt="Floating Element 0"
              />
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={1} className="top-[20%] left-[-5%] opacity-75">
            <motion.div className="h-[15rem] w-[15rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
              <MotionImage
                src="/images/floating-image-1.png"
                fill
                quality={100}
                className="object-cover"
                alt="Floating Element 1"
              />
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={2} className="top-[-50%] right-[15%] opacity-55">
            <motion.div className="h-[11rem] w-[11rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
              <MotionImage
                src="/images/floating-image-2.png"
                fill
                quality={100}
                className="object-cover"
                alt="Floating Element 2"
              />
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={1.25} className="top-[115%] right-[20%] opacity-60">
            <motion.div className="h-[11rem] w-[11rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
              <MotionImage
                src="/images/floating-image-3.png"
                fill
                quality={100}
                className="object-cover"
                alt="Floating Element 3"
              />
            </motion.div>
          </FloatingElement>

          {/* Additional floating elements for images 4 through 12 */}
          <FloatingElement depth={1.25} className="top-[-50%] left-[15%] opacity-65">
            <motion.div className="h-[11rem] w-[11rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
              <MotionImage
                src="/images/floating-image-4.png"
                fill
                quality={100}
                className="object-cover"
                alt="Floating Element 4"
              />
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={1} className="top-[115%] left-[20%] opacity-45 blur-[0.5px]">
            <motion.div className="h-[12rem] w-[12rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
              <MotionImage
                src="/images/floating-image-5.png"
                fill
                quality={100}
                className="object-cover"
                alt="Floating Element 5"
              />
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={0.5} className="top-[105%] left-[-10%] opacity-70">
            <motion.div className="h-[18rem] w-[18rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
              <MotionImage
                src="/images/floating-image-6.png"
                fill
                quality={100}
                className="object-cover"
                alt="Floating Element 6"
              />
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={0.5} className="top-[85%] right-[-10%] opacity-65">
            <motion.div className="h-[17rem] w-[17rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
              <MotionImage
                src="/images/floating-image-7.png"
                fill
                quality={100}
                className="object-cover"
                alt="Floating Element 7"
              />
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={1} className="top-[5%] right-[-3%] opacity-80">
            <motion.div className="h-[15rem] w-[15rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
              <MotionImage
                src="/images/floating-image-8.png"
                fill
                quality={100}
                className="object-cover"
                alt="Floating Element 8"
              />
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={0.5} className="top-[-35%] right-[-10%] opacity-40 blur-[0.5px]">
            <motion.div className="h-[8rem] w-[8rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
              <MotionImage
                src="/images/floating-image-9.png"
                fill
                quality={100}
                className="object-cover"
                alt="Floating Element 9"
              />
            </motion.div>
          </FloatingElement>
        </Floating>
      </div>

      {/* Hero Content */}
      <div className="flex flex-col items-center gap-6 z-10">
        <h1
          className={`z-10 text-[8rem] text-primary font-black subpixel-antialiased tracking-tight text-center leading-[7rem] ${gloock.className}`}
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
              className="cursor-pointer"
            /> 
          </p>
        </h1>
        <p className="z-10 uppercase font-thin text-lg w-[100%] text-[1.25rem] text-primary text-center">
          {"Hue-fit is a modern men's apparel online shopping platform that leverages Artificial Intelligence to"}
          <br />
          {"help find the best outfit for you based on your physical features, and Augmented Reality technology"}
          <br />
          {"for virtual fitting, to ensure that you already know the outfit matches your looks."}
        </p>
        <div className="flex flex-row items-center gap-5 z-10">
          <button
            onClick={handleDownload}
            className="flex flex-row items-center justify-center bg-primary border-muted/30 py-4 border-2 rounded-lg shadow-primary/25 shadow-md min-w-[20rem] hover:ring-2 hover:ring-primary duration-300 ease-in-out"
          >
            <p className="uppercase tracking-widest text-pure font-bold text-md">Try Hue-Fit</p>
            <Download className="mb-[2px] stroke-[3px] stroke-pure ml-1" width={20} height={20} />
          </button>
          <div className="group">
            <Link
              className={`flex flex-row items-center justify-center py-4 border-primary/50 border-2 rounded-lg min-w-[20rem] group-hover:border-primary duration-300 ease-in-out`}
              href={routes.partnership}
            >
              <p className="uppercase tracking-widest text-primary/70 font-bold text-md group-hover:text-primary duration-300 ease-in-out">Partner With Us</p>
              <ArrowUpRight className="mb-[2px] stroke-[3px] stroke-primary/70 ml-1 group-hover:stroke-primary duration-300 ease-in-out" width={20} height={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
