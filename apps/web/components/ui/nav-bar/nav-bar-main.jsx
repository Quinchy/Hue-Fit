"use client";

import Link from "next/link";
import routes from "@/routes";
import HueFitLogo from "@/public/images/HueFitLogo";
import LetterSwapPingPong from "@/components/fancy/letter-swap-pingpong-anim";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const NavbarMain = () => {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavbarFixed, setIsNavbarFixed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavbarFixed(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full z-[9999]">
      {/* Navbar */}
      <div
        className={`${
          isNavbarFixed
            ? "fixed top-0 left-0 right-0 bg-pure animate-slide-down"
            : "relative"
        } z-[9999] w-full`}
      >
        <div className="flex flex-row items-center justify-between py-8 px-8 sm:px-14 md:px-24 lg:px-32 xl:px-52">
          <Link href={routes.home}>
            <HueFitLogo height={45} className="fill-primary" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex flex-row items-center gap-10 uppercase">
            {["home", "about", "contact", "partnership"].map((page) => (
              <div key={page} className="group z-50">
                <Link
                  className="text-primary/95 tracking-wider text-base block"
                  href={routes[page]}
                >
                  <LetterSwapPingPong
                    label={page.charAt(0).toUpperCase() + page.slice(1)}
                    staggerFrom="last"
                  />
                </Link>
              </div>
            ))}
            <Link
              className="bg-primary min-w-44 py-3 z-50"
              href={session ? routes.dashboard : routes.login}
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
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <nav className="xl:hidden fixed inset-0 bg-card flex flex-col items-center justify-center z-[9999]">
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
                  className="block text-primary/95 tracking-wider text-2xl font-light duration-500 ease-in-out"
                  href={routes[page]}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                className="block bg-primary min-w-48 py-4 text-center mt-4"
                href={session ? routes.dashboard : routes.login}
                onClick={() => setMobileMenuOpen(false)}
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
};

export default NavbarMain;
