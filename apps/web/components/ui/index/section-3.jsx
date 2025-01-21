"use client";

import Image from "next/image";
import { Gloock } from "next/font/google";
import { Download } from "lucide-react";
import LetterSwapPingPong from "@/components/fancy/letter-swap-pingpong-anim"

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

export default function Section3() {
  return (
    <section className="relative w-full flex flex-col">
      <div className="h-[20rem]"></div>
      <div className="flex flex-col items-center justify-center gap-4">
        <Image
          src="/images/logo-text.svg"
          width={1000}
          height={1000}
          className="mx-auto w-1/2 sm:w-1/3 md:w-1/4 lg:w-auto"
        />
        <h1 className={`text-[2.65rem] text-primary/90 font-black subpixel-antialiased tracking-tight text-center ${gloock.className}`}>
          <div className="flex flex-col items-center">            
            <div className="flex flex-row items-center gap-2">
              <LetterSwapPingPong label="EFFORTLESS." staggerFrom={"last"} />
              <LetterSwapPingPong label="PERSONALIZED" staggerFrom={"last"} />  
            </div>
            <p><LetterSwapPingPong label="STYLISH." staggerFrom={"last"} /></p>
          </div>
        </h1>
        <button className="flex flex-row items-center justify-center bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] border-muted/30 py-4 border-2 rounded-lg shadow-pure/25 shadow-md min-w-[20rem] hover:ring-2 hover:ring-primary duration-300 ease-in-out">
          <p className="uppercase tracking-widest text-pure font-bold text-md">Try Hue-Fit</p>
          <Download className="mb-[2px] stroke-[3px] stroke-pure ml-1" width={20} height={20} />
        </button>
      </div>
      <div className="h-[20rem]"></div>

      {/* Black gradient overlay covering entire section using pure variable */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: 'linear-gradient(to top, hsl(var(--pure)) 0%, transparent 100%)'
        }}
      />
    </section>
  );
}
