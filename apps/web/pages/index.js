"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { Button } from "@/components/ui/button";
import { Gloock } from "next/font/google";
import { ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import Floating, { FloatingElement } from "@/components/fancy/parallax-floating";
import Image from "next/image";
import routes from "@/routes";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

export default function Home() {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate("img", { opacity: [0, 1] }, { duration: 0.5, delay: stagger(0.15) });
  }, [animate]);

  return (
    <div className="flex flex-col w-[75%] gap-[25rem] mt-[15rem] mb-[15rem]">
      {/* Hero */}
      <div
        className="relative"
        ref={scope}
      >
        {/* Absolutely Positioned Floating Background with Motion */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-visible">
          <Floating sensitivity={-1}>
            {/* Floating Elements for Images 1 to 12 */}
            <FloatingElement depth={0.5} className="top-[-65%] left-[-10%] opacity-25">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Image
                  src="/images/floating-image-0.png"
                  width={170}
                  height={170}
                  quality={100}
                  className="object-cover rounded"
                  alt="Floating Element 0"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={0.75} className="top-[5%] left-[0%] opacity-75">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Image
                  src="/images/floating-image-1.png"
                  width={200}
                  height={200}
                  quality={100}
                  className="object-cover rounded"
                  alt="Floating Element 1"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={0.75} className="top-[-50%] right-[10%] opacity-55">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Image
                  src="/images/floating-image-2.png"
                  width={165}
                  height={165}
                  quality={100}
                  className="object-cover rounded"
                  alt="Floating Element 2"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={0.75} className="top-[95%] right-[1%] opacity-60">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Image
                  src="/images/floating-image-3.png"
                  width={175}
                  height={175}
                  quality={100}
                  className="object-cover rounded"
                  alt="Floating Element 3"
                />
              </motion.div>
            </FloatingElement>

            {/* Additional floating elements for images 4 through 12 */}
            <FloatingElement depth={0.5} className="top-[-40%] left-[15%] opacity-65">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Image
                  src="/images/floating-image-4.png"
                  width={150}
                  height={150}
                  quality={100}
                  className="object-cover rounded"
                  alt="Floating Element 4"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={0.5} className="top-[65%] left-[10%] opacity-45 blur-[0.5px]">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Image
                  src="/images/floating-image-5.png"
                  width={155}
                  height={155}
                  quality={100}
                  className="object-cover rounded"
                  alt="Floating Element 5"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={1.25} className="top-[80%] left-[-8%] opacity-70">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Image
                  src="/images/floating-image-6.png"
                  width={250}
                  height={250}
                  quality={100}
                  className="object-cover rounded"
                  alt="Floating Element 6"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={0.5} className="top-[65%] right-[-15%] opacity-65">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Image
                  src="/images/floating-image-7.png"
                  width={155}
                  height={155}
                  quality={100}
                  className="object-cover rounded"
                  alt="Floating Element 7"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={0.75} className="top-[5%] right-[-8%] opacity-80">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Image
                  src="/images/floating-image-8.png"
                  width={215}
                  height={215}
                  quality={100}
                  className="object-cover rounded"
                  alt="Floating Element 8"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={0.25} className="top-[-15%] right-[-16%] opacity-40 blur-[0.5px]">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Image
                  src="/images/floating-image-9.png"
                  width={125}
                  height={125}
                  quality={100}
                  className="object-cover rounded"
                  alt="Floating Element 9"
                />
              </motion.div>
            </FloatingElement>
          </Floating>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-center gap-4 z-10">
          <h1
            className={`text-[8rem] text-primary font-black subpixel-antialiased tracking-tight text-center leading-[7rem] ${gloock.className}`}
          >
            DISCOVER <br />
            <p className="bg-[linear-gradient(90deg,_var(--rainbow1)_15%,_var(--rainbow2)_20%,_var(--rainbow3)_30%,_var(--rainbow4)_40%,_var(--rainbow5)_55%,_var(--rainbow6)_90%)] bg-clip-text text-transparent">
              YOUR STYLE
            </p>
          </h1>
          <p className="uppercase font-thin text-lg w-[100%] text-[1.25rem] text-primary text-center">
            {"Hue-fit is a modern men's apparel online shopping platform that leverages Artificial Intelligence to"}
            <br />
            {"help find the best outfit for you based on your physical features, and Augmented Reality technology"}
            <br />
            {"for virtual fitting, to ensure that you already know the outfit matches your looks."}
          </p>
          <div className="flex flex-row items-center gap-5">
            <Button className="text-base font-medium flex flex-row pl-[4rem] pr-[3.5rem] py-7 border-muted/30 border-2 rounded-lg shadow-primary/25 shadow-md mb-20 mt-16 min-w-[20rem]">
              <p className="uppercase tracking-widest">Try Hue-Fit</p>
              <Download className="scale-115 mb-[2px]" width={30} height={30} />
            </Button>
            <Link
              className={`${buttonVariants({ variant: "outline" })} !text-base !font-medium flex flex-row pl-[4rem] pr-[3.5rem] py-7 shadow-primary/25 shadow-md mb-20 mt-16 min-w-[20rem]`}
              href={routes.partnership}
            >
              <p className="uppercase tracking-widest">Partner With Us</p>
              <ArrowUpRight className="scale-125 mb-[2px]" width={30} height={30} />
            </Link>
          </div>
        </div>
      </div>
      {/* Section 1 */}
      <div>
        <div className="flex flex-col items-start gap-4 z-10">
          <h1
            className={`text-[8rem] text-primary font-black subpixel-antialiased tracking-tight text-start leading-[7rem] ${gloock.className}`}
          >
            ELEVATE <br />
            <p>
              YOUR LOOKS
            </p>
          </h1>
          <p className="uppercase font-thin text-lg w-[100%] text-[1.25rem] text-primary text-start">
            {"Discover outfits designed to match your unique features, from"}
            <br />
            {"skin tone to body shape. With AI-driven precision, achieve a look that"}
            <br />
            {"reflects your personal style and enhances your confidence."}
          </p>
          <div className="flex flex-row items-center gap-5">
            <Link
              className={`${buttonVariants({ variant: "outline" })} !text-base !font-medium flex flex-row pl-[4rem] pr-[3.5rem] py-7 shadow-primary/25 shadow-md mb-20 mt-16 min-w-[10rem]`}
              href={routes.partnership}
            >
              <p className="uppercase tracking-widest">Learn More</p>
              <ArrowUpRight className="scale-125 mb-[2px]" width={30} height={30} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
