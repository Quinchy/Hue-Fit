"use client";

import Image from "next/image";
import Float from "@/components/fancy/float";
import { CheckCircle } from "lucide-react";
import { Gloock } from "next/font/google";
import { useEffect, useState, useRef } from "react";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

// A simple fade-in component with delay that only starts when trigger is true
function FadeIn({ delay, children, trigger = true }) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (!trigger) return;
    const timeout = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay, trigger]);
  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      {children}
    </div>
  );
}

export default function Hero() {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  // Trigger the animations only when the section is in view
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
      className="flex flex-col-reverse 2xl:flex-row items-center justify-between gap-20 z-50 pt-[10rem] pl-[1rem] pr-[1rem] sm:pl-[3rem] sm:pr-[3rem] md:pl-[5rem] md:pr-[5rem] lg:pl-[8rem] lg:pr-[8rem] xl:pl-[12rem] xl:pr-[12rem] 2xl:pl-[13rem] 2xl:pr-0"
    >
      <div className="flex flex-col items-center 2xl:items-start gap-4 z-10">
        {/* Fade in the h1 element first */}
        <FadeIn delay={0} trigger={isInView}>
          <div>
            <h1
              className={`${gloock.className} text-5xl md:text-6xl lg:text-7xl min-[1713px]:text-7xl text-primary font-black text-center 2xl:text-start cursor-pointer`}
            >
              ELEVATE
              <br />
              YOUR LOOKS
            </h1>
          </div>
        </FadeIn>
        {/* Fade in the paragraph next */}
        <FadeIn delay={300} trigger={isInView}>
          <div>
            <p className="text-base w-full 2xl:text-lg text-primary/75 text-center 2xl:text-start">
              We from HueFit empower men to boost confidence and redefine
              shopping through innovative AI and AR-driven fashion experiences.
            </p>
          </div>
        </FadeIn>

        {/* Fade in the two-column feature list */}
        <FadeIn delay={600} trigger={isInView}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Column 1 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2">
                <CheckCircle
                  size={20}
                  className="bg-primary text-pure rounded-full p-1"
                />
                <span className="text-base text-primary/75">
                  Personalized AI-based styling
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle
                  size={20}
                  className="bg-primary text-pure rounded-full p-1"
                />
                <span className="text-base text-primary/75">
                  AR-driven virtual try-ons
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle
                  size={20}
                  className="bg-primary text-pure rounded-full p-1"
                />
                <span className="text-base text-primary/75">
                  Smart fit recommendations
                </span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2">
                <CheckCircle
                  size={20}
                  className="bg-primary text-pure rounded-full p-1"
                />
                <span className="text-base text-primary/75">
                  Curated fashion collections
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle
                  size={20}
                  className="bg-primary text-pure rounded-full p-1"
                />
                <span className="text-base text-primary/75">
                  Easy online-to-store transition
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle
                  size={20}
                  className="bg-primary text-pure rounded-full p-1"
                />
                <span className="text-base text-primary/75">
                  Confidence-building style tips
                </span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
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
      </div>
    </div>
  );
}
