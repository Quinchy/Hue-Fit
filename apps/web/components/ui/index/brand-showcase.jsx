"use client";

import Image from "next/image";

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
    <div className="relative w-full overflow-hidden bg-pure py-8 cursor-pointer">
      <div className="flex items-center justify-center whitespace-nowrap w-[200%] animate-marquee">
        {/* First copy of logos */}
        {brandLogos.map((brand, i) => (
          <span
            key={`brand-${i}`}
            className="inline-block mx-4 md:mx-10 select-none flex-shrink-0"
          >
            <div className="flex items-center justify-center">
              <Image
                src={`/images/${brand}.svg`}
                alt={brand}
                width={80} // 80px on mobile
                height={80}
                className="object-contain invert dark:invert-0"
              />
            </div>
          </span>
        ))}
        {/* Second copy of logos (duplicate for seamless scrolling) */}
        {brandLogos.map((brand, i) => (
          <span
            key={`brand-repeat-${i}`}
            className="inline-block mx-4 md:mx-10 select-none flex-shrink-0"
          >
            <div className="flex items-center justify-center">
              <Image
                src={`/images/${brand}.svg`}
                alt={brand}
                width={80}
                height={80}
                className="object-contain invert dark:invert-0"
              />
            </div>
          </span>
        ))}
      </div>
    </div>
  );
}
