// pages/_app.js
"use client";

import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import Head from "next/head";
import routes from "@/routes";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NavbarMain from "@/components/ui/nav-bar/nav-bar-main";
import NavbarAccount from "@/components/ui/nav-bar/nav-bar-account";
import NavbarDashboard from "@/components/ui/nav-bar/nav-bar-dashboard";
import { FormProvider } from "@/providers/form-provider";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import hueFitLoading from "@/public/animations/hue-fit-loading.json";
import { AnimatePresence, motion } from "framer-motion";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const router = useRouter();
  const normalizedPathname =
    router.pathname === "/shopSetup" ? routes.shopSetup : router.pathname;

  // Only show splash on the index page
  const isIndex = normalizedPathname === "/";
  const [loadingSplash, setLoadingSplash] = useState(isIndex);

  useEffect(() => {
    if (isIndex) {
      const timer = setTimeout(() => setLoadingSplash(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isIndex]);

  // Splash screen slide-up variants
  const splashVariants = {
    initial: { y: 0 },
    exitTop: { y: "-100%", transition: { duration: 0.8, ease: "easeInOut" } },
    exitBot: {
      y: "-100%",
      transition: { duration: 0.8, ease: "easeInOut", delay: 0.2 },
    },
  };

  // Navbar / layout logic
  let title = "Hue-Fit";
  let NavBarComponent = NavbarMain;
  let divClassName = "flex flex-col justify-center items-center";

  const hideNavbarPaths = [
    routes.shopSetup,
    routes.shopStatus,
    routes.shopSuccess,
    "/test",
  ];
  const isNavbarHidden = hideNavbarPaths.includes(normalizedPathname);
  const isVirtualFittingMobile = normalizedPathname.startsWith(
    routes.virtualFittingMobile
  );

  if (!isVirtualFittingMobile) {
    if (normalizedPathname.startsWith(routes.account)) {
      NavBarComponent = NavbarAccount;
    } else if (normalizedPathname.startsWith(routes.dashboard)) {
      NavBarComponent = NavbarDashboard;
      divClassName = "flex flex-col items-start ml-[16.5rem]";
    }
  } else {
    divClassName = "flex flex-col justify-center items-center w-full h-full";
  }

  return (
    <SessionProvider session={session}>
      <FormProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className={GeistSans.className}>
            {/* Splashscreen layers */}
            <AnimatePresence initial={false}>
              {loadingSplash && (
                <>
                  {/* Top layer: white background + Lottie */}
                  <motion.div
                    key="splash-top"
                    className="fixed inset-0 bg-pure flex items-center justify-center z-[9999]"
                    variants={splashVariants}
                    initial="initial"
                    exit="exitTop"
                  >
                    <Lottie
                      animationData={hueFitLoading}
                      loop
                      speed={1.5}
                      style={{ width: 500, height: 500 }}
                    />
                  </motion.div>
                  {/* Bottom layer: primary background */}
                  <motion.div
                    key="splash-bot"
                    className="fixed inset-0 bg-primary z-[9998]"
                    variants={splashVariants}
                    initial="initial"
                    exit="exitBot"
                  />
                </>
              )}
            </AnimatePresence>

            <Head>
              <title>{title}</title>
            </Head>

            {normalizedPathname === "/404" ? (
              <Component {...pageProps} />
            ) : (
              <>
                {!isVirtualFittingMobile && !isNavbarHidden && (
                  <NavBarComponent />
                )}
                <div className={divClassName}>
                  <Component {...pageProps} />
                </div>
              </>
            )}
          </main>
        </ThemeProvider>
      </FormProvider>
    </SessionProvider>
  );
}
