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

// Parent variant: staggers children
const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

// Child fade-in variant
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function Section3() {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/HueFit.apk"; // Ensure the APK is in your public folder
    link.download = "HueFit.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.section
      className="relative w-full flex flex-col"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="h-[20rem]" />

      {/* Content Container */}
      <motion.div
        className="flex flex-col items-center justify-center gap-8"
        variants={fadeInUp}
      >
        {/* Rotating Gradient + Logo */}
        <motion.div
          className="relative flex justify-center items-center"
          variants={fadeInUp}
        >
          <motion.div
            className="absolute -top-[8rem] z-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, ease: "linear", repeat: Infinity }}
          >
            <div className="rotate-90">
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

          <motion.div variants={fadeInUp}>
            <Image
              src="/images/logo-text.svg"
              width={1000}
              height={1000}
              className="relative z-10 mx-auto w-1/2 lg:w-auto drop-shadow-2xl invert dark:invert-0"
            />
          </motion.div>
        </motion.div>

        {/* Animated Text */}
        <motion.h1
          className={`md:text-lg lg:text-4xl text-primary/90 font-black subpixel-antialiased tracking-tight text-center ${gloock.className}`}
          variants={fadeInUp}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-row items-center gap-2">
              <LetterSwapPingPong label="EFFORTLESS." staggerFrom="last" />
              <LetterSwapPingPong label="PERSONALIZED" staggerFrom="last" />
            </div>
            <p>
              <LetterSwapPingPong label="STYLISH." staggerFrom="last" />
            </p>
          </div>
        </motion.h1>

        {/* Download Button */}
        <motion.button
          onClick={handleDownload}
          className="flex flex-row items-center justify-center drop-shadow-2xl bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] bg-[length:200%_200%] bg-[position:0%_50%] transition-all duration-500 min-w-48 lg:min-w-64 py-3 lg:py-4 z-20 hover:bg-[position:100%_50%]"
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

      <div className="h-[20rem]" />
    </motion.section>
  );
}
