"use client";

import Image from "next/image";
import Float from "@/components/fancy/float";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Gloock } from "next/font/google";
import routes from "@/routes";
import LetterSwapPingPong from "@/components/fancy/letter-swap-pingpong-anim";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import SimpleMarquee from "@/components/fancy/simple-marquee";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

export default function Section1() {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

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

  const fadeInVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <>
      <div className="pb-64">
        <div
          ref={containerRef}
          className="flex flex-col-reverse 2xl:flex-row items-center justify-between gap-20 z-50 pt-[10rem] sm:pt-[15rem] md:pt-[20rem] pl-[1rem] pr-[1rem] sm:pl-[3rem] sm:pr-[3rem] md:pl-[5rem] md:pr-[5rem] lg:pl-[8rem] lg:pr-[8rem] xl:pl-[12rem] xl:pr-[12rem] 2xl:pl-[13rem] 2xl:pr-0"
        >
          {/* Text Column */}
          <div className="flex flex-col items-center 2xl:items-start gap-4 z-10">
            <motion.div
              variants={fadeInVariant}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0}
            >
              <h1
                className={`${gloock.className} text-5xl md:text-6xl lg:text-7xl min-[1713px]:text-7xl text-primary font-black text-center 2xl:text-start cursor-pointer`}
              >
                ELEVATE
                <br />
                YOUR LOOKS
              </h1>
            </motion.div>
            <motion.div
              variants={fadeInVariant}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0.3}
            >
              <p className="text-base w-full 2xl:text-lg text-primary/75 text-center 2xl:text-start">
                Discover outfits designed to match your unique features, from
                skin tone to body shape. With AI-driven precision, achieve a
                look that reflects your personal style and enhances your
                confidence.
              </p>
            </motion.div>
            <motion.div
              variants={fadeInVariant}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0.6}
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
          {/* Image Column */}
          <div className="relative h-[420px] xl:h-[480px] 2xl:h-[520px] w-full">
            <div
              className="
                absolute
                w-full
                h-full
                rounded-ss-[10rem]
                rounded-ee-[10rem]
                xl:rounded-ss-[12rem]
                xl:rounded-ee-[12rem]
                2xl:rounded-ss-[15rem]
                2xl:rounded-ee-none
                bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)]
              "
            />

            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { delay: 0.9, duration: 0.6, ease: "easeOut" },
                },
              }}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <Float speed={0.25}>
                <div className="absolute top-[10rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:scale-105 duration-200 cursor-pointer transition-transform w-full max-w-[380px] lg:max-w-[430px] xl:max-w-[460px] aspect-square">
                  <Image
                    src="/images/floating-image-section-1.png"
                    alt="Foreground"
                    fill
                    quality={100}
                    className="select-none object-contain"
                  />
                </div>
              </Float>
            </motion.div>
          </div>
        </div>
        {/* ——— New Marquee Gallery ——— */}
        <div className="w-full mt-56">
          <SimpleMarquee
            baseVelocity={4}
            repeat={4}
            draggable={false}
            scrollSpringConfig={{ damping: 50, stiffness: 400 }}
            slowDownFactor={0.1}
            slowdownOnHover
            slowDownSpringConfig={{ damping: 60, stiffness: 300 }}
            scrollAwareDirection={true}
            useScrollVelocity={true}
            direction="left"
            className="overflow-hidden"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="shrink-0 px-4">
                <Image
                  src={`/images/floating-image-${i}.png`}
                  alt={`Floating ${i}`}
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
            ))}
          </SimpleMarquee>
        </div>
      </div>
    </>
  );
}
