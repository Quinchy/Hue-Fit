"use client";

import { Gloock } from "next/font/google";
import { Shirt, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
  hover: { scale: 1.0, transition: { duration: 0.3 } },
};

const iconVariants = {
  hover: { scale: 1.1, transition: { duration: 0.3 } },
};

export default function Section2() {
  return (
    <div className="relative flex flex-col gap-20 w-full px-4">
      {/* Title */}
      <h1
        className={`${gloock.className} text-[8rem] text-primary uppercase text-center font-black subpixel-antialiased tracking-tight leading-[7rem]`}
      >
        Goals <br />
        and Purpose
      </h1>

      {/* Animated Grid Layout */}
      <motion.div
        className="grid grid-cols-2 gap-5 w-full max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* First Column (Spans 2 Rows) */}
        <motion.div
          className="border-2 border-primary/30 border-dashed p-8 flex flex-col justify-center items-center gap-5 text-white rounded-2xl row-span-2"
          variants={cardVariants}
          whileHover="hover"
        >
          <h1 className={`${gloock.className} text-6xl text-primary/95`}>1</h1>
          <motion.div
            className="border-2 border-dashed border-primary/55 rounded-full p-5"
            variants={iconVariants}
            whileHover="hover"
          >
            <Shirt className="w-12 h-12 stroke-primary/55" />
          </motion.div>
          <p className="uppercase font-thin text-base w-full text-primary/75 text-center">
            {"To provide users with AI-driven, customized outfit suggestions based on their unique body type, skin tone, and style preferences."}
          </p>
        </motion.div>

        {/* Second Column - First Row */}
        <motion.div
          className="border-2 border-primary/30 border-dashed p-8 flex flex-row gap-10 justify-between items-center text-white rounded-2xl"
          variants={cardVariants}
          whileHover="hover"
        >
          <h1 className={`${gloock.className} text-6xl text-primary/95`}>2</h1>
          <motion.div
            className="border-2 border-dashed border-primary/55 rounded-full p-5"
            variants={iconVariants}
            whileHover="hover"
          >
            <ShoppingBag className="w-12 h-12 stroke-primary/55" />
          </motion.div>
          <p className="uppercase font-thin text-base w-full text-primary/75 text-start">
            {"To streamline the shopping experience by connecting users to recommended fashion items from partnered stores directly within the app."}
          </p>
        </motion.div>

        {/* Second Column - Second Row */}
        <motion.div
          className="border-2 border-primary/30 border-dashed p-8 flex flex-row gap-10 justify-between items-center text-white rounded-2xl"
          variants={cardVariants}
          whileHover="hover"
        >
          <h1 className={`${gloock.className} text-6xl text-primary/95`}>3</h1>
          <motion.div
            className="border-2 border-dashed border-primary/55 rounded-full p-5"
            variants={iconVariants}
            whileHover="hover"
          >
            <User className="w-12 h-12 stroke-primary/55" />
          </motion.div>
          <p className="uppercase font-thin text-base w-full text-primary/75 text-start">
            {"To empower users to express their personal style and enhance their confidence by offering curated looks that reflect their individuality."}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
