"use client";

import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNavigation } from "@/components/ui/carousel";
import { Gloock } from "next/font/google";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

export default function Section2() {
  return (
    <div className="relative flex flex-col gap-[10rem] w-full px-4">
      <h1 className={`text-[8rem] text-primary font-black subpixel-antialiased tracking-tight text-end leading-[7rem] ${gloock.className}`}>
        STYLE MADE <br />
        <p>SMARTER</p>
      </h1>
      <div className="relative w-full right-[-50rem]">
        <Carousel>
          <CarouselNavigation className="absolute left-[28rem] top-[-3rem] w-full justify-start gap-2" alwaysShow />
          <CarouselContent>
            {/* Carousel Item 1 */}
            <CarouselItem className="basis-1/4 pl-4 py-4">
              <div className="relative group">
                <Image
                  src="/images/carousel-1.png"
                  width={400}
                  height={400}
                  className="rounded-[1.5rem] object-cover shadow-pure shadow-md"
                  alt="Carousel Image 1"
                />
                <div className="absolute group-hover:backdrop-blur-[5px] inset-0 bg-card/90 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all duration-700 ease-in-out" />
                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 text-white rounded-[1.5rem] overflow-hidden group-hover:justify-start transition-all duration-700 ease-in-out">
                  <div className="translate-y-[2rem] group-hover:translate-y-0 transition-transform duration-700 ease-in-out">
                    <h3 className="text-2xl font-semibold uppercase">
                      AI-Powered Outfit Recommendation
                    </h3>
                  </div>
                  <div className="translate-y-full group-hover:translate-y-[-0.5rem] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out mt-4">
                    <p className="text-sm">
                      Our advanced AI technology crafts unique outfit combinations tailored to your body type, preferences, and individual style, ensuring a flawless look every time.
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
            {/* Carousel Item 2 */}
            <CarouselItem className="basis-1/4 pl-4 py-4">
              <div className="relative group">
                <Image
                  src="/images/carousel-2.png"
                  width={400}
                  height={400}
                  className="rounded-[1.5rem] object-cover shadow-pure shadow-md"
                  alt="Carousel Image 2"
                />
                <div className="absolute group-hover:backdrop-blur-[5px] inset-0 bg-card/90 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all duration-700 ease-in-out" />
                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 text-white rounded-[1.5rem] overflow-hidden group-hover:justify-start transition-all duration-700 ease-in-out">
                  <div className="translate-y-[2rem] group-hover:translate-y-0 transition-transform duration-700 ease-in-out">
                    <h3 className="text-2xl font-semibold uppercase">
                      Skin Tone-Based Outfit Color Matching
                    </h3>
                  </div>
                  <div className="translate-y-full group-hover:translate-y-[-0.5rem] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out mt-4">
                    <p className="text-sm">
                      Get expert color combination recommendations that perfectly complement your skin tone, enhancing your natural beauty and personal aesthetic.
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
            {/* Carousel Item 3 */}
            <CarouselItem className="basis-1/4 pl-4 py-4">
              <div className="relative group">
                <Image
                  src="/images/carousel-3.png"
                  width={400}
                  height={400}
                  className="rounded-[1.5rem] object-cover shadow-pure shadow-md"
                  alt="Carousel Image 3"
                />
                <div className="absolute group-hover:backdrop-blur-[5px] inset-0 bg-card/90 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all duration-700 ease-in-out" />
                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 text-white rounded-[1.5rem] overflow-hidden group-hover:justify-start transition-all duration-700 ease-in-out">
                  <div className="translate-y-[2rem] group-hover:translate-y-0 transition-transform duration-700 ease-in-out">
                    <h3 className="text-2xl font-semibold uppercase">
                      Seamless Shopping Integration
                    </h3>
                  </div>
                  <div className="translate-y-full group-hover:translate-y-[-0.5rem] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out mt-4">
                    <p className="text-sm">
                      Once your outfit is generated, easily shop the recommended pieces directly from partnered stores, streamlining your fashion experience from selection to purchase.
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
