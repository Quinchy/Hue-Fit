"use client";

import Image from "next/image";
import { Gloock } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import routes from "@/routes";
import LetterSwapPingPong from "@/components/fancy/letter-swap-pingpong-anim";
import ScrambleHover from "@/components/fancy/scramble-hover";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

const fadeInVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Section2() {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  // IntersectionObserver to trigger animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-10 w-full px-5 sm:px-14 md:px-24 lg:px-40 xl:px-52 2xl:px-56"
    >
      {/* Heading */}
      <motion.h1
        className={`text-5xl md:text-6xl lg:text-7xl min-[1713px]:text-7xl text-primary font-black text-center 2xl:text-end cursor-pointer ${gloock.className}`}
        variants={fadeInVariant}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        custom={0}
      >
        STYLE MADE <br />
        <p>SMARTER</p>
      </motion.h1>

      {/* Grid of Cards */}
      <div className="relative w-full h-[900px]">
        <div className="grid grid-cols-2 gap-2 lg:gap-3 h-full">
          {/* Left Column */}
          <div className="grid grid-rows-2 gap-2 lg:gap-3 h-full">
            {/* Card 1 */}
            <motion.div
              className="relative group cursor-pointer overflow-hidden"
              variants={fadeInVariant}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0.2}
            >
              <Image
                src="/images/carousel-1.png"
                alt="Carousel Image 1"
                fill
                quality={100}
                className="object-cover shadow-pure shadow-md saturate-0 group-hover:saturate-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[5px] transition-opacity duration-700 ease-in-out group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="xl:text-base 2xl:text-xl font-semibold uppercase">
                  AI-Powered Suggestion
                </h3>
                <div className="overflow-hidden transition-all duration-700 ease-in-out max-h-0 group-hover:max-h-48">
                  <p className="text-sm mt-2">
                    Our advanced AI technology crafts unique outfit combinations
                    tailored to your body type, preferences, and individual
                    style, ensuring a flawless look every time.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              className="relative group cursor-pointer overflow-hidden"
              variants={fadeInVariant}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0.3}
            >
              <Image
                src="/images/carousel-2.png"
                alt="Carousel Image 2"
                fill
                quality={100}
                className="object-cover shadow-pure shadow-md saturate-0 group-hover:saturate-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[5px] transition-opacity duration-700 ease-in-out group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="xl:text-base 2xl:text-xl font-semibold uppercase">
                  Skintone Color Matching
                </h3>
                <div className="overflow-hidden transition-all duration-700 ease-in-out max-h-0 group-hover:max-h-48">
                  <p className="text-sm mt-2">
                    Get expert color combination recommendations that perfectly
                    complement your skin tone, enhancing your natural beauty and
                    personal aesthetic.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="grid grid-rows-3 gap-2 lg:gap-3 h-full">
            {/* Card 3 */}
            <motion.div
              className="relative group cursor-pointer overflow-hidden"
              variants={fadeInVariant}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0.4}
            >
              <Image
                src="/images/carousel-3.jpg"
                alt="Carousel Image 3"
                fill
                quality={100}
                className="object-cover shadow-pure shadow-md saturate-0 group-hover:saturate-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[5px] transition-opacity duration-700 ease-in-out group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="xl:text-base 2xl:text-xl font-semibold uppercase">
                  Effortless Ordering
                </h3>
                <div className="overflow-hidden transition-all duration-700 ease-in-out max-h-0 group-hover:max-h-48">
                  <p className="text-sm mt-2">
                    Once your outfit is generated, place your order effortlessly
                    with just a few clicks. Enjoy a smooth journey from
                    selection to doorstep delivery.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              className="relative group cursor-pointer overflow-hidden"
              variants={fadeInVariant}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0.5}
            >
              <Image
                src="/images/carousel-4.png"
                alt="Carousel Image 4"
                fill
                quality={100}
                className="object-cover shadow-pure shadow-md saturate-0 group-hover:saturate-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[5px] transition-opacity duration-700 ease-in-out group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="xl:text-base 2xl:text-xl font-semibold uppercase">
                  Virtual Fitting Room
                </h3>
                <div className="overflow-hidden transition-all duration-700 ease-in-out max-h-0 group-hover:max-h-48">
                  <p className="text-sm mt-2">
                    Try on outfits virtually and visualize the perfect fit
                    before purchasing. Explore styles and sizes tailored to your
                    preferences.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 5 */}
            <motion.div
              className="relative group cursor-pointer overflow-hidden"
              variants={fadeInVariant}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0.6}
            >
              <Image
                src="/images/carousel-5.png"
                alt="Carousel Image 5"
                fill
                quality={100}
                className="object-cover shadow-pure shadow-md saturate-0 group-hover:saturate-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[5px] transition-opacity duration-700 ease-in-out group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="xl:text-base 2xl:text-xl font-semibold uppercase">
                  Seamless Shopping
                </h3>
                <div className="overflow-hidden transition-all duration-700 ease-in-out max-h-0 group-hover:max-h-48">
                  <p className="text-sm mt-2">
                    Effortlessly explore, compare, and purchase outfits from
                    multiple partnered stores—all within one convenient app.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center 2xl:items-end gap-4">
        <motion.div
          variants={fadeInVariant}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          custom={0.8}
        >
          <h1
            className={`${gloock.className} text-[2rem] text-primary uppercase font-black text-center 2xl:text-end`}
          >
            Discover the Power of Smart Fashion
          </h1>
          <p className="text-base w-full 2xl:text-lg text-primary/75 text-center 2xl:text-end max-w-3xl">
            Our innovative AI technology not only helps you create personalized
            outfits, but also matches colors to your skin tone and connects you
            to the perfect wardrobe pieces through seamless shopping. Ready to
            elevate your look with cutting-edge fashion tech?
          </p>
        </motion.div>

        <motion.div
          variants={fadeInVariant}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          custom={1}
          className="group"
        >
          <Link
            className="flex flex-row items-center justify-center min-w-44 lg:min-w-48 py-3 lg:py-4 ring-primary ring-[1px] mt-4"
            href={routes.about}
          >
            <p className="uppercase text-primary font-medium tracking-wider text-base">
              <LetterSwapPingPong label="LEARN MORE" staggerFrom="last" />
            </p>
            <ArrowUpRight
              className="mb-[2px] stroke-[2px] stroke-primary ml-1"
              width={20}
              height={20}
            />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
