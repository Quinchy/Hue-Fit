// File: DashboardPagesNavigation.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function DashboardPagesNavigation({ items }) {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="relative flex flex-row border-b">
      {/* Shared sliding background */}
      <div
        className="absolute top-0 left-0 h-full bg-muted rounded transition-all duration-300 ease-in-out pointer-events-none"
        style={{
          width: "10rem", // Match the width of the links
          transform: hoveredIndex !== null
            ? `translateX(${hoveredIndex * 10}rem)` // Move the background based on the hovered index
            : `translateX(${items.findIndex(({ href }) => href === router.asPath) * 10}rem)`, // Move to the active link
        }}
      ></div>

      {items.map(({ label, href }, index) => {
        const isActive = router.asPath === href;
        return (
          <Link
            key={href}
            href={href}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`uppercase text-sm max-w-[10rem] min-w-[10rem] relative text-center ${
              isActive ? "font-medium text-primary border-b-2 border-primary" : "text-primary/50"
            }`}
          >
            <div className="px-10 py-3">{label}</div>
          </Link>
        );
      })}
    </div>
  );
}
