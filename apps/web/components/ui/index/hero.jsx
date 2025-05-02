"use client";

import { Gloock } from "next/font/google";
import { ArrowUpRight, Download, Sparkles, Camera } from "lucide-react";
import Link from "next/link";
import ScrambleHover from "@/components/fancy/scramble-hover";
import routes from "@/routes";
import Image from "next/image";
import { motion, useViewportScroll, useTransform } from "framer-motion";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

export default function Hero() {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/HueFit.apk";
    link.download = "HueFit.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // account for splash (1s) + slide-up exit (0.8s)
  const SPLASH_OFFSET = 1.8;

  const { scrollYProgress } = useViewportScroll();
  const dashY = useTransform(scrollYProgress, [0, 1], [-20, 1250]);
  const mobY = useTransform(scrollYProgress, [0, 1], [0, 20]);

  const fadeIn = (delay) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: SPLASH_OFFSET + delay, duration: 0.6 },
    },
  });

  return (
    <div className="relative z-10 flex flex-col items-center gap-5 px-4 md:px-8 lg:px-0">
      {/* Pills */}
      <motion.div
        variants={fadeIn(0.1)}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row gap-2 uppercase font-extralight text-sm"
      >
        <p className="flex gap-2 items-center border-[1px] border-primary/40 py-2 px-4 rounded-full">
          <Sparkles className="stroke-[2px]" size={15} /> AI-Powered
          Recommendation
        </p>
        <p className="flex gap-2 items-center border-[1px] border-primary/40 py-2 px-4 rounded-full">
          <Camera className="stroke-[2px]" size={15} /> Virtual Fitting
          Technology
        </p>
      </motion.div>

      {/* Heading */}
      <motion.div
        variants={fadeIn(0.2)}
        initial="hidden"
        animate="visible"
        className="text-center max-w-3xl"
      >
        <h1
          className={`z-10 max-[368px]:text-3xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-primary select-none ${gloock.className}`}
        >
          <ScrambleHover
            text="DISCOVER OUTFITS"
            scrambleSpeed={50}
            maxIterations={8}
            useOriginalCharsOnly
            className="cursor-pointer"
          />
          <br />
          <span className="bg-[linear-gradient(90deg,_var(--rainbow1)_15%,_var(--rainbow2)_20%,_var(--rainbow3)_30%,_var(--rainbow4)_40%,_var(--rainbow5)_55%,_var(--rainbow6)_90%)] bg-clip-text text-transparent whitespace-normal break-words">
            <ScrambleHover
              text="ELEVATE YOUR STYLE"
              scrambleSpeed={50}
              maxIterations={8}
              useOriginalCharsOnly
              className="cursor-pointer"
            />
          </span>
        </h1>
      </motion.div>

      {/* Description */}
      <motion.p
        variants={fadeIn(0.3)}
        initial="hidden"
        animate="visible"
        className="uppercase text-balance text-sm lg:text-lg tracking-wide text-primary/80 text-center max-w-3xl"
      >
        HueFit is a modern {"men's"} apparel shopping platform that leverages
        advanced technology to help you find the perfect outfit.
      </motion.p>

      {/* Buttons */}
      <motion.div
        variants={fadeIn(0.4)}
        initial="hidden"
        animate="visible"
        className="flex flex-col xl:flex-row items-center gap-4 mt-4"
      >
        <button
          onClick={handleDownload}
          className="flex items-center justify-center bg-primary border border-primary min-w-[11rem] lg:min-w-[13rem] py-3 lg:py-4 gap-1 hover:scale-105 transition-all duration-200 ease-in-out"
        >
          <Download
            className="-mb-1 stroke-[3px] stroke-pure animate-bounce"
            width={15}
            height={15}
          />
          <span className="uppercase text-pure font-medium lg:font-bold text-sm">
            Download HueFit
          </span>
        </button>

        <Link
          href={routes.partnership}
          className="flex items-center justify-center text-primary min-w-[11rem] lg:min-w-[13rem] py-3 lg:py-4 ring-1 ring-primary gap-1 hover:scale-105 transition-all duration-200 ease-in-out"
        >
          <span className="uppercase lg:font-bold text-sm">
            Partner With Us
          </span>
          <ArrowUpRight
            className="ml-1 mb-[1px] stroke-[3px]"
            width={15}
            height={15}
          />
        </Link>
      </motion.div>

      {/* Dashboard + Mobile Previews */}
      <motion.div
        style={{ y: dashY }}
        variants={fadeIn(0.5)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative w-full max-w-7xl mt-10 md:mt-20 -mb-44 sm:-mb-36 md:-mb-20 lg:mb-0"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-border/50 p-1 md:p-3 rounded-2xl shadow-pure shadow-xl"
        >
          <Image
            src="/images/hue-fit-dashboard.png"
            alt="HueFit Dashboard"
            width={1200}
            height={700}
            className="select-none object-cover w-full h-auto rounded-xl border-primary/10 border-2 border-dashed"
          />
        </motion.div>
        <motion.div
          style={{ y: mobY }}
          variants={fadeIn(0.6)}
          initial="hidden"
          whileInView="visible"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          viewport={{ once: true }}
          className="absolute top-[5%] left-[70%] w-1/4 h-auto bg-border/50 p-1 md:p-3 rounded-2xl shadow-pure shadow-xl"
        >
          <Image
            src="/images/hue-fit-mobile.jpg"
            alt="HueFit Mobile"
            width={300}
            height={600}
            className="select-none object-contain w-full h-auto rounded-xl border-primary/10 border-2 border-dashed"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
