"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Float from "@/components/fancy/float";
import { Gloock } from "next/font/google";
import ScrambleIn from "@/components/fancy/scramble-in";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

export default function Hero() {
  const paragraphRef = useRef(null);

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
            text={`Hue-Fit uses AI to create personalized outfits based on your
unique features, like skin tone, body shape, height, weight, and age.
With its advanced Cutting-Edge AI it suggests the
perfect combination of upper wear, lower wear, and footwear
tailored just for you. Trained on a vast collection of curated
styles, Hue-Fit not only recommends outfits but also finds
the best pieces in stores for a seamless shopping experience,
making it easy to look great and feel confident.`}
            scrambleSpeed={3}
            scrambledLetterCount={5}
            className="uppercase font-thin text-lg w-[100%] text-[1.25rem] text-primary text-start"
            scrambledClassName="uppercase font-thin text-lg w-[100%] text-[1.25rem] text-primary text-start"
            autoStart={false}
            // Removed onComplete and onStart related to the Learn More button
          />
        </div>
        {/* Removed the Learn More button section */}
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
