"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { Button } from "@/components/ui/button";
import { Gloock } from "next/font/google";
import { ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import Floating, { FloatingElement } from "@/components/fancy/parallax-floating";
import Float from "@/components/fancy/float";
import ScrambleHover from "@/components/fancy/scramble-hover"
import { Carousel, CarouselContent, CarouselItem, CarouselNavigation } from "@/components/ui/carousel";
import Image from "next/image";
import routes from "@/routes";

// Create a motion-enabled Next.js Image component
const MotionImage = motion(Image);

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
      <div className="relative" ref={scope}>
        {/* Absolutely Positioned Floating Background with Motion */}
        <div className="absolute inset-0 overflow-visible">
          <Floating sensitivity={-1}>
            {/* Floating Elements for Images 1 to 12 */}
            <FloatingElement depth={0.5} className="top-[-55%] left-[-10%] opacity-25">
              <motion.div className="h-[9rem] w-[9rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
                <MotionImage
                  src="/images/floating-image-0.png"
                  fill
                  quality={100}
                  className="object-cover"
                  alt="Floating Element 0"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={1.25} className="top-[5%] left-[-4%] opacity-75">
              <motion.div className="h-[15rem] w-[15rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
                <MotionImage
                  src="/images/floating-image-1.png"
                  fill
                  quality={100}
                  className="object-cover"
                  alt="Floating Element 1"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={2} className="top-[-45%] right-[10%] opacity-55">
              <motion.div className="h-[11rem] w-[11rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
                <MotionImage
                  src="/images/floating-image-2.png"
                  fill
                  quality={100}
                  className="object-cover"
                  alt="Floating Element 2"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={1.25} className="top-[95%] right-[5%] opacity-60">
              <motion.div className="h-[12rem] w-[12rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
                <MotionImage
                  src="/images/floating-image-3.png"
                  fill
                  quality={100}
                  className="object-cover"
                  alt="Floating Element 3"
                />
              </motion.div>
            </FloatingElement>

            {/* Additional floating elements for images 4 through 12 */}
            <FloatingElement depth={1.25} className="top-[-40%] left-[15%] opacity-65">
              <motion.div className="h-[13rem] w-[13rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
                <MotionImage
                  src="/images/floating-image-4.png"
                  fill
                  quality={100}
                  className="object-cover"
                  alt="Floating Element 4"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={1} className="top-[65%] left-[10%] opacity-45 blur-[0.5px]">
              <motion.div className="h-[10rem] w-[10rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
                <MotionImage
                  src="/images/floating-image-5.png"
                  fill
                  quality={100}
                  className="object-cover"
                  alt="Floating Element 5"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={2} className="top-[80%] left-[-14%] opacity-70">
              <motion.div className="h-[18rem] w-[18rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
                <MotionImage
                  src="/images/floating-image-6.png"
                  fill
                  quality={100}
                  className="object-cover"
                  alt="Floating Element 6"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={1} className="top-[65%] right-[-15%] opacity-65">
              <motion.div className="h-[13rem] w-[13rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
                <MotionImage
                  src="/images/floating-image-7.png"
                  fill
                  quality={100}
                  className="object-cover"
                  alt="Floating Element 7"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={2} className="top-[5%] right-[-3%] opacity-80">
              <motion.div className="h-[15rem] w-[15rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
                <MotionImage
                  src="/images/floating-image-8.png"
                  fill
                  quality={100}
                  className="object-cover"
                  alt="Floating Element 8"
                />
              </motion.div>
            </FloatingElement>
            <FloatingElement depth={0.25} className="top-[-15%] right-[-14%] opacity-40 blur-[0.5px]">
              <motion.div className="h-[8rem] w-[8rem] hover:scale-105 duration-200 cursor-pointer transition-transform">
                <MotionImage
                  src="/images/floating-image-9.png"
                  fill
                  quality={100}
                  className="object-cover"
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
          <div className="flex flex-row items-center gap-5 z-10">
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
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-start gap-4 z-10">
          <h1 className={`text-[8rem] text-primary font-black subpixel-antialiased tracking-tight text-start leading-[7rem] ${gloock.className}`}>
            ELEVATE <br />
            <p>YOUR LOOKS</p>
          </h1>
          <p className="uppercase font-thin text-lg w-[100%] text-[1.25rem] text-primary text-start">
            {"Discover outfits designed to match your unique features, from"}
            <br />
            {"skin tone to body shape. With AI-driven precision, achieve a look that"}
            <br />
            {"reflects your personal style and enhances your confidence."}
          </p>
          <Link
            className={`${buttonVariants({ variant: "outline" })} !text-base !font-medium flex flex-row pl-[4rem] pr-[3.5rem] py-7 shadow-primary/25 shadow-md mb-20 mt-10 min-w-[10rem]`}
            href={routes.about}
          >
            <p className="uppercase tracking-widest">Learn More</p>
            <ArrowUpRight className="scale-125 mb-[2px]" width={30} height={30} />
          </Link>
        </div>
        <div className="relative w-[400px] h-[400px]">
          {/* Background Image */}
          <Image
            src="/images/gradient-pic-bg.png"
            width={400}
            height={400}
            quality={100}
            className="absolute top-0 left-0"
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
                className="absolute top-[-9rem] left-0"
                alt="Foreground"
              />
            </div>
          </Float>
        </div>
      </div>
      {/* Section 2 */}
      <div className="relative flex flex-col gap-[10rem] w-full px-4">
        <h1 className={`text-[8rem] text-primary font-black subpixel-antialiased tracking-tight text-end leading-[7rem] ${gloock.className}`}>
          STYLE MADE <br />
          <p>SMARTER</p>
        </h1>
        <div className="relative w-full right-[-50rem]"> {/* Shift carousel to the right */}
          <Carousel>
              <CarouselNavigation
                className="absolute left-[28rem] top-[-3rem] w-full justify-start gap-2"
                alwaysShow
              />
            <CarouselContent>
              <CarouselItem className="basis-1/4 pl-4 py-4">
                <div className="relative group">
                  {/* Image */}
                  <Image
                    src={"/images/carousel-1.png"}
                    width={400}
                    height={400}
                    className="rounded-[1.5rem] object-cover shadow-primary/10 shadow-md"
                    alt="Carousel Image 1"
                  />
                  {/* Full Overlay */}
                  <div
                    className="absolute group-hover:backdrop-blur-[5px] inset-0 bg-card/90 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all duration-700 ease-in-out"
                  />
                  {/* Text Container */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end items-start p-4 text-white rounded-[1.5rem] overflow-hidden group-hover:justify-start transition-all duration-700 ease-in-out"
                  >
                    {/* Title */}
                    <div
                      className="translate-y-[2rem] group-hover:translate-y-0 transition-transform duration-700 ease-in-out"
                    >
                      <h3 className="text-2xl font-semibold uppercase">{"AI-Powered Outfit Recommendation"}</h3>
                    </div>
                    {/* Description */}
                    <div
                      className="translate-y-full group-hover:translate-y-[-0.5rem] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out mt-4"
                    >
                      <p className="text-sm">
                        {"Our advanced AI technology crafts unique outfit combinations tailored to your body type, preferences, and individual style, ensuring a flawless look every time."}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="basis-1/4 pl-4 py-4">
                <div className="relative group">
                  {/* Image */}
                  <Image
                    src={"/images/carousel-2.png"}
                    width={400}
                    height={400}
                    className="rounded-[1.5rem] object-cover shadow-primary/10 shadow-md"
                    alt="Carousel Image 1"
                  />
                  {/* Full Overlay */}
                  <div
                    className="absolute group-hover:backdrop-blur-[5px] inset-0 bg-card/90 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all duration-700 ease-in-out"
                  />
                  {/* Text Container */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end items-start p-4 text-white rounded-[1.5rem] overflow-hidden group-hover:justify-start transition-all duration-700 ease-in-out"
                  >
                    {/* Title */}
                    <div
                      className="translate-y-[2rem] group-hover:translate-y-0 transition-transform duration-700 ease-in-out"
                    >
                      <h3 className="text-2xl font-semibold uppercase">{"Skin Tone-Based Outfit Color Matching"}</h3>
                    </div>
                    {/* Description */}
                    <div
                      className="translate-y-full group-hover:translate-y-[-0.5rem] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out mt-4"
                    >
                      <p className="text-sm">
                        {"Get expert color combination recommendations that perfectly complement your skin tone, enhancing your natural beauty and personal aesthetic."}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="basis-1/4 pl-4 py-4">
                <div className="relative group">
                  {/* Image */}
                  <Image
                    src={"/images/carousel-3.png"}
                    width={400}
                    height={400}
                    className="rounded-[1.5rem] object-cover shadow-primary/10 shadow-md"
                    alt="Carousel Image 1"
                  />
                  {/* Full Overlay */}
                  <div
                    className="absolute group-hover:backdrop-blur-[5px] inset-0 bg-card/90 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all duration-700 ease-in-out"
                  />
                  {/* Text Container */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end items-start p-4 text-white rounded-[1.5rem] overflow-hidden group-hover:justify-start transition-all duration-700 ease-in-out"
                  >
                    {/* Title */}
                    <div
                      className="translate-y-[2rem] group-hover:translate-y-0 transition-transform duration-700 ease-in-out"
                    >
                      <h3 className="text-2xl font-semibold uppercase">{"Seamless Shopping Integration"}</h3>
                    </div>
                    {/* Description */}
                    <div
                      className="translate-y-full group-hover:translate-y-[-0.5rem] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out mt-4"
                    >
                      <p className="text-sm">
                        {"Once your outfit is generated, easily shop the recommended pieces directly from partnered stores, streamlining your fashion experience from selection to purchase."}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
