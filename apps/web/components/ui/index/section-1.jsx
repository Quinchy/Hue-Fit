"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Float from "@/components/fancy/float";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ScrambleIn from "@/components/fancy/scramble-in";
import { Gloock } from "next/font/google";
import routes from "@/routes";
import { motion } from "framer-motion";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

const linkVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, y: 0 },
};

export default function Section1() {
  const paragraphRef = useRef(null);
  const [linkVisible, setLinkVisible] = useState(false);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (
            entry.target.id === "scramble-paragraph" &&
            paragraphRef.current
          ) {
            paragraphRef.current.start();
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, options);
    const paragraphElement = document.getElementById("scramble-paragraph");

    if (paragraphElement) observer.observe(paragraphElement);

    return () => {
      if (paragraphElement) observer.unobserve(paragraphElement);
    };
  }, []);

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="flex flex-col items-start gap-5 z-10">
        <div>
          <h1
            className={`${gloock.className} text-[8rem] text-primary font-black subpixel-antialiased tracking-tight text-start leading-[7rem]`}
          >
            ELEVATE
            <br />
            YOUR LOOKS
          </h1>
        </div>
        <div id="scramble-paragraph">
          <ScrambleIn
            ref={paragraphRef}
            text={`Discover outfits designed to match your unique features, from
skin tone to body shape. With AI-driven precision, achieve a look that
reflects your personal style and enhances your confidence.`}
            scrambleSpeed={10}
            scrambledLetterCount={5}
            className="uppercase font-thin text-lg w-[100%] text-[1.25rem] text-primary text-start"
            scrambledClassName="uppercase font-thin text-lg w-[100%] text-[1.25rem] text-primary text-start"
            autoStart={false}
            onComplete={() => {
              setLinkVisible(true);
            }}
            onStart={() => {
              setLinkVisible(false);
            }}
          />
        </div>
        {linkVisible && (
          <motion.div
            variants={linkVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="group"
          >
            <Link
              className="flex flex-row items-center justify-center py-4 border-primary/50 border-2 rounded-lg min-w-[20rem] group-hover:border-primary duration-300 ease-in-out"
              href={routes.about}
            >
              <p className="uppercase tracking-widest text-primary/70 font-bold text-md group-hover:text-primary duration-300 ease-in-out">
                Learn More
              </p>
              <ArrowUpRight
                className="mb-[2px] stroke-[3px] stroke-primary/70 ml-1 group-hover:stroke-primary duration-300 ease-in-out"
                width={20}
                height={20}
              />
            </Link>
          </motion.div>
        )}
      </div>
      <div className="relative w-[400px] h-[400px]">
        {/* Background Image */}
        <Image
          src="/images/gradient-pic-bg.png"
          width={400}
          height={400}
          quality={100}
          className="absolute top-[10%] left-0"
          alt="Background"
        />
        {/* Foreground Image */}
        <Float speed={0.25}>
          <div className="hover:scale-105 duration-200 cursor-pointer transition-transform">
            <Image
              src="/images/floating-image-section-1.png"
              width={360}
              height={360}
              quality={100}
              className="absolute top-[-5rem] left-0"
              alt="Foreground"
            />
          </div>
        </Float>
      </div>
    </div>
  );
}
