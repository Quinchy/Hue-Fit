"use client";

import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNavigation } from "@/components/ui/carousel";
import { Gloock } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import routes from "@/routes";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

export default function Section2() {
  return (
    <div className="relative flex flex-col gap-10 w-full px-4">
      <h1 className={`text-[8rem] text-primary font-black subpixel-antialiased tracking-tight text-end leading-[7rem] ${gloock.className}`}>
        STYLE MADE <br />
        <p>SMARTER</p>
      </h1>
      <div className="relative w-full mt-[8rem] right-[-15rem]">
        <Carousel>
          <CarouselNavigation className="absolute left-[58rem] top-[-3rem] w-full justify-start gap-2" alwaysShow />
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
                <div className="absolute group-hover:backdrop-blur-[5px] inset-0 bg-black/45 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all duration-700 ease-in-out" />
                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 text-white rounded-[1.5rem] overflow-hidden group-hover:justify-start transition-all duration-700 ease-in-out">
                  <div className="translate-y-[2rem] group-hover:translate-y-0 transition-transform duration-700 ease-in-out">
                    <h3 className="text-2xl font-semibold uppercase">
                      {"AI-Powered Outfit Recommendation"}
                    </h3>
                  </div>
                  <div className="translate-y-full group-hover:translate-y-[-0.5rem] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out mt-4">
                    <p className="text-sm">
                      {"Our advanced AI technology crafts unique outfit combinations tailored to your body type, preferences, and individual style, ensuring a flawless look every time."}
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
                <div className="absolute group-hover:backdrop-blur-[5px] inset-0 bg-black/45 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all duration-700 ease-in-out" />
                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 text-white rounded-[1.5rem] overflow-hidden group-hover:justify-start transition-all duration-700 ease-in-out">
                  <div className="translate-y-[2rem] group-hover:translate-y-0 transition-transform duration-700 ease-in-out">
                    <h3 className="text-2xl font-semibold uppercase">
                      {"Skin Tone-Based Outfit Color Matching"}
                    </h3>
                  </div>
                  <div className="translate-y-full group-hover:translate-y-[-0.5rem] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out mt-4">
                    <p className="text-sm">
                      {"Get expert color combination recommendations that perfectly complement your skin tone, enhancing your natural beauty and personal aesthetic."}
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
                <div className="absolute group-hover:backdrop-blur-[5px] inset-0 bg-black/45 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all duration-700 ease-in-out" />
                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 text-white rounded-[1.5rem] overflow-hidden group-hover:justify-start transition-all duration-700 ease-in-out">
                  <div className="translate-y-[2rem] group-hover:translate-y-0 transition-transform duration-700 ease-in-out">
                    <h3 className="text-2xl font-semibold uppercase">
                      {"EFFORTLESS ORDERING PROCESS"}
                    </h3>
                  </div>
                  <div className="translate-y-full group-hover:translate-y-[-0.5rem] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out mt-4">
                    <p className="text-sm">
                      {"Once your outfit is generated, place your order effortlessly with just a few clicks. Select your favorite pieces directly from partnered stores, ensuring a smooth journey from generation to doorstep delivery."}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
            {/* Carousel Item 4 */}
            <CarouselItem className="basis-1/4 pl-4 py-4">
              <div className="relative group">
                <Image
                  src="/images/carousel-4.png"
                  width={400}
                  height={400}
                  className="rounded-[1.5rem] object-cover shadow-pure shadow-md"
                  alt="Carousel Image 4"
                />
                <div className="absolute group-hover:backdrop-blur-[5px] inset-0 bg-black/45 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all duration-700 ease-in-out" />
                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 text-white rounded-[1.5rem] overflow-hidden group-hover:justify-start transition-all duration-700 ease-in-out">
                  <div className="translate-y-[2rem] group-hover:translate-y-0 transition-transform duration-700 ease-in-out">
                    <h3 className="text-2xl font-semibold uppercase">
                      {"VIRTUAL FITTING ROOM"}
                    </h3>
                  </div>
                  <div className="translate-y-full group-hover:translate-y-[-0.5rem] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out mt-4">
                    <p className="text-sm">
                      {"Try on outfits virtually and visualize the perfect fit before purchasing. Explore styles and sizes tailored to your preferences, ensuring confidence in every selection from our partnered brands."}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
            {/* Carousel Item 5 */}
            <CarouselItem className="basis-1/4 pl-4 py-4">
              <div className="relative group">
                <Image
                  src="/images/carousel-5.png"
                  width={400}
                  height={400}
                  className="rounded-[1.5rem] object-cover shadow-pure shadow-md"
                  alt="Carousel Image 5"
                />
                <div className="absolute group-hover:backdrop-blur-[5px] inset-0 bg-black/45 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all duration-700 ease-in-out" />
                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 text-white rounded-[1.5rem] overflow-hidden group-hover:justify-start transition-all duration-700 ease-in-out">
                  <div className="translate-y-[2rem] group-hover:translate-y-0 transition-transform duration-700 ease-in-out">
                    <h3 className="text-2xl font-semibold uppercase">
                      {"Seamless Shopping Integration"}
                    </h3>
                  </div>
                  <div className="translate-y-full group-hover:translate-y-[-0.5rem] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out mt-4">
                    <p className="text-sm">
                      {"Discover an integrated platform featuring a variety of clothing shops. Effortlessly explore, compare, and purchase outfits from multiple partnered stores, all within one convenient app."}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
      <div className="flex flex-row items-center justify-end gap-4">
        <div className="flex flex-col">
          <h1 className={`${gloock.className} text-[2rem] text-primary uppercase font-black subpixel-antialiased tracking-tight text-start`}>
            {"Discover the Power of Smart Fashion"}
          </h1>
          <div className="flex flex-col">
            <p className="uppercase font-thin w-[100%] text-[1rem] text-primary text-start">
              {"Our innovative AI technology not only helps you create personalized outfits,"}
            </p>
            <p className="uppercase font-thin w-[100%] text-[1rem] text-primary text-start">
              {"but also matches colors to your skin tone and connects you to the perfect wardrobe pieces"}
            </p>
            <p className="uppercase font-thin w-[100%] text-[1rem] text-primary text-start">
              {"through seamless shopping. Ready to elevate your look with cutting-edge fashion tech?"}
            </p>
            <p className="uppercase font-thin w-[100%] text-[1rem] text-primary text-start">
              {"Dive deeper into how it all works."}
            </p>
          </div>
        </div>
        <div className="group">
          <Link
            className="flex flex-row items-center justify-center py-4 border-primary/50 border-2 rounded-lg min-w-[20rem] group-hover:border-primary duration-300 ease-in-out"
            href={routes.about}
          >
            <p className="uppercase tracking-widest text-primary/70 font-bold text-md group-hover:text-primary duration-300 ease-in-out">
              Know More
            </p>
            <ArrowUpRight
              className="mb-[2px] stroke-[3px] stroke-primary/70 ml-1 group-hover:stroke-primary duration-300 ease-in-out"
              width={20}
              height={20}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
