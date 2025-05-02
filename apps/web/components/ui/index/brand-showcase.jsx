"use client";

import Image from "next/image";
import SimpleMarquee from "@/components/fancy/simple-marquee";

// Array of brand names, each must have a matching .svg in /public/images
const brandLogos = [
  "adidas",
  "giorgio",
  "gucci",
  "hnm",
  "shopify",
  "the-north-face",
  "supreme",
  "vans",
  "nike",
  "levis",
  "converse",
];

export default function BrandShowcase() {
  return (
    <div className="relative w-full overflow-hidden py-8 cursor-pointer">
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
        className="flex items-center justify-start"
      >
        {brandLogos.map((brand, i) => (
          <div
            key={i}
            className="inline-flex items-center justify-center mx-4 md:mx-10 select-none flex-shrink-0"
          >
            <Image
              src={`/images/${brand}.svg`}
              alt={brand}
              width={60}
              height={60}
              className="object-contain invert dark:invert-0"
            />
          </div>
        ))}
      </SimpleMarquee>
    </div>
  );
}
