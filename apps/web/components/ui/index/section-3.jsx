"use client";

import Image from "next/image";
import { Gloock } from "next/font/google";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import LetterSwapPingPong from "@/components/fancy/letter-swap-pingpong-anim";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

// Simplified fade-in reveal animation variants
const revealVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

export default function Section3() {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/HueFit.apk"; // Ensure the APK is in your public folder
    link.download = "HueFit.apk"; // Optional: specify the default filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.section
      className="relative w-full flex flex-col"
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="h-[20rem]"></div>

      {/* Content Container */}
      <motion.div
        className="flex flex-col items-center justify-center gap-4"
        variants={revealVariants}
      >
        <motion.div
          variants={revealVariants}
          className="relative flex justify-center items-center"
        >
          {/* Outer layer for continuous rotation */}
          <motion.div
            className="absolute -top-[8rem] z-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, ease: "linear", repeat: Infinity }}
          >
            <div className="rotate-90">
              {/* Inner layer for scale and opacity animation */}
              <motion.div
                animate={{
                  scale: [1.65, 1.35, 1.65],
                  opacity: [0.5, 0.4, 0.5],
                }}
                transition={{
                  duration: 90,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                <Image
                  src="/images/gradient-bg.png"
                  width={1000}
                  height={12000}
                  className="w-full filter saturate-[500%] dark:saturate-100"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Logo stays on top */}
          <Image
            src="/images/logo-text.svg"
            width={1000}
            height={1000}
            className="relative z-10 mx-auto w-1/2 lg:w-auto drop-shadow-2xl invert dark:invert-0"
          />
        </motion.div>

        {/* Animated Text */}
        <motion.h1
          className={`md:text-lg lg:text-4xl text-primary/90 font-black subpixel-antialiased tracking-tight text-center ${gloock.className}`}
          variants={revealVariants}
        >
          <div className="flex flex-col items-center">
            <div className="flex flex-row items-center gap-2">
              <LetterSwapPingPong label="EFFORTLESS." staggerFrom="last" />
              <LetterSwapPingPong label="PERSONALIZED" staggerFrom="last" />
            </div>
            <p>
              <LetterSwapPingPong label="STYLISH." staggerFrom="last" />
            </p>
          </div>
        </motion.h1>

        {/* Download HueFit Button */}
        <motion.button
          onClick={handleDownload}
          className="flex flex-row items-center justify-center drop-shadow-2xl bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] bg-[length:200%_200%] bg-[position:0%_50%] transition-all duration-500 min-w-48 lg:min-w-64 py-3 lg:py-4 z-20 hover:bg-[position:100%_50%]"
          variants={revealVariants}
        >
          <p className="uppercase text-pure font-medium lg:font-bold text-sm text-center">
            <LetterSwapPingPong label="Download HueFit" staggerFrom="last" />
          </p>
          <Download
            className="mb-[1px] stroke-[3px] stroke-pure ml-1"
            width={13}
            height={13}
          />
        </motion.button>
      </motion.div>

      <div className="h-[20rem]"></div>
    </motion.section>
  );
}
