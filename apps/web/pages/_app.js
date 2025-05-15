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
const SPLASH_DURATION_MS = 1800;

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const router = useRouter();
  const [loadingSplash, setLoadingSplash] = useState(false);

  const triggerSplash = () => {
    setLoadingSplash(true);
    setTimeout(() => setLoadingSplash(false), SPLASH_DURATION_MS);
  };

  useEffect(() => {
    if (router.pathname === "/") {
      triggerSplash();
    }
    const onRouteChangeComplete = (url) => {
      if (url === "/") {
        triggerSplash();
      }
    };
    router.events.on("routeChangeComplete", onRouteChangeComplete);
    return () => {
      router.events.off("routeChangeComplete", onRouteChangeComplete);
    };
  }, [router.events, router.pathname]);

  const splashVariants = {
    initial: { y: 0 },
    exitTop: { y: "-100%", transition: { duration: 0.8, ease: "easeInOut" } },
    exitBot: {
      y: "-100%",
      transition: { duration: 0.8, ease: "easeInOut", delay: 0.2 },
    },
  };

  let title = "Hue-Fit";
  let NavBarComponent = NavbarMain;
  let divClassName = "flex flex-col justify-center items-center";

  const hideNavbarPaths = [
    routes.shopSetup,
    routes.shopStatus,
    routes.shopSuccess,
    "/test",
  ];
  const isNavbarHidden = hideNavbarPaths.includes(router.pathname);
  const isVirtualFittingMobile = router.pathname.startsWith(
    routes.virtualFittingMobile
  );

  if (!isVirtualFittingMobile) {
    if (router.pathname.startsWith(routes.account)) {
      NavBarComponent = NavbarAccount;
    } else if (router.pathname.startsWith(routes.dashboard)) {
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
            <AnimatePresence initial={false}>
              {loadingSplash && (
                <>
                  <motion.div
                    key="splash-top"
                    className="fixed inset-0 bg-pure flex items-center justify-center z-[9999]"
                    variants={splashVariants}
                    initial="initial"
                    exit="exitTop"
                  >
                    <Lottie
                      animationData={hueFitLoading}
                      loop={false}
                      initialSegment={[0, 300]}
                      speed={1}
                      style={{ width: 500, height: 500 }}
                    />
                  </motion.div>
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
            {router.pathname === "/404" ? (
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
