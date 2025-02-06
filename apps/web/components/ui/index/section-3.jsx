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

// Framer Motion Reveal Animation
const revealVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 } },
};

export default function Section3() {
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
      <motion.div className="flex flex-col items-center justify-center gap-4" variants={revealVariants}>
        
        {/* Logo Image */}
        <motion.div variants={revealVariants}>
          <Image
            src="/images/logo-text.svg"
            width={1000}
            height={1000}
            className="mx-auto w-1/2 sm:w-1/3 md:w-1/4 lg:w-auto"
          />
        </motion.div>

        {/* Animated Text */}
        <motion.h1 
          className={`text-[2.65rem] text-primary/90 font-black subpixel-antialiased tracking-tight text-center ${gloock.className}`} 
          variants={revealVariants}
        >
          <div className="flex flex-col items-center">            
            <div className="flex flex-row items-center gap-2">
              <LetterSwapPingPong label="EFFORTLESS." staggerFrom={"last"} />
              <LetterSwapPingPong label="PERSONALIZED" staggerFrom={"last"} />  
            </div>
            <p><LetterSwapPingPong label="STYLISH." staggerFrom={"last"} /></p>
          </div>
        </motion.h1>

        {/* Try Hue-Fit Button */}
        <motion.button 
          className="flex flex-row items-center justify-center bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] border-muted/30 py-4 border-2 rounded-lg shadow-pure/25 shadow-md min-w-[20rem] hover:ring-2 hover:ring-primary duration-300 ease-in-out"
          variants={revealVariants}
        >
          <p className="uppercase tracking-widest text-pure font-bold text-md">Try Hue-Fit</p>
          <Download className="mb-[2px] stroke-[3px] stroke-pure ml-1" width={20} height={20} />
        </motion.button>
      </motion.div>

      <div className="h-[20rem]"></div>

      {/* Black gradient overlay covering entire section */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: 'linear-gradient(to top, hsl(var(--pure)) 0%, transparent 100%)'
        }}
      />
    </motion.section>
  );
}
