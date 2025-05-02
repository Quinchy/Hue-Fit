// components/ui/nav-bar/nav-bar-main.jsx
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import routes from "@/routes";
import HueFitLogo from "@/public/images/HueFitLogo";
import LetterSwapPingPong from "@/components/fancy/letter-swap-pingpong-anim";

export default function NavbarMain() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavbarFixed, setIsNavbarFixed] = useState(false);

  // height in px (6.5rem × 16px)
  const HEADER_HEIGHT = 6.5 * 16;

  useEffect(() => {
    const onScroll = () => setIsNavbarFixed(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initialize state
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reusable nav content
  const NavContent = () => (
    <div className="flex items-center justify-between h-full px-8 sm:px-14 md:px-24 lg:px-32 xl:px-52">
      <Link href={routes.home} className="hover:scale-110 transition-transform duration-300 ease-in-out">
        <HueFitLogo height={45} className="fill-primary" />
      </Link>

      {/* Desktop nav */}
      <nav className="hidden xl:flex items-center gap-10 uppercase">
        {["home", "about", "contact", "partnership"].map((page) => (
          <Link
            key={page}
            href={routes[page]}
            className="text-primary/95 tracking-wider text-base"
          >
            <LetterSwapPingPong
              label={page[0].toUpperCase() + page.slice(1)}
              staggerFrom="last"
            />
          </Link>
        ))}
        <Link
          href={session ? routes.dashboard : routes.login}
          className="bg-primary px-4 py-3"
        >
          <p className="uppercase text-pure font-bold text-base text-center">
            <LetterSwapPingPong
              label={session ? "Dashboard" : "Login"}
              staggerFrom="last"
            />
          </p>
        </Link>
      </nav>

      {/* Mobile hamburger */}
      <div className="xl:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-primary focus:outline-none"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full z-[1100]">
      {/* 1) Spacer always reserves header height in the flow */}
      <div style={{ height: HEADER_HEIGHT }} />

      {/* 2) Transparent overlay header */}
      <header
        className="absolute inset-x-0 top-0 bg-transparent z-[1100] pointer-events-auto"
        style={{ height: HEADER_HEIGHT }}
      >
        <NavContent />
      </header>

      {/* 3) Animated fixed header appears/disappears */}
      <AnimatePresence>
        {isNavbarFixed && (
          <motion.header
            key="fixed-nav"
            className="fixed inset-x-0 top-0 bg-pure shadow z-[1100]"
            style={{ height: HEADER_HEIGHT }}
            initial={{ y: -HEADER_HEIGHT, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -HEADER_HEIGHT, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <NavContent />
          </motion.header>
        )}
      </AnimatePresence>

      {/* 4) Mobile menu overlay */}
      {mobileMenuOpen && (
        <nav className="fixed inset-0 bg-card flex flex-col items-center justify-center z-[1200]">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-primary focus:outline-none"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <ul className="flex flex-col gap-8 uppercase text-center">
            {["home", "about", "contact", "partnership"].map((page) => (
              <li key={page}>
                <Link
                  href={routes[page]}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-primary/95 tracking-wider text-2xl font-light"
                >
                  {page[0].toUpperCase() + page.slice(1)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={session ? routes.dashboard : routes.login}
                onClick={() => setMobileMenuOpen(false)}
                className="block bg-primary px-4 py-3 text-center mt-4"
              >
                <p className="uppercase text-pure font-semibold text-2xl">
                  {session ? "Dashboard" : "Login"}
                </p>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
