// _app.js
import "@/styles/globals.css";
import { GeistSans } from 'geist/font/sans';
import Head from 'next/head';
import routes from "@/routes";
import { useRouter } from 'next/router';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NavbarMain from "@/components/ui/nav-bar/nav-bar-main";
import NavbarAccount from "@/components/ui/nav-bar/nav-bar-account";
import NavbarDashboard from "@/components/ui/nav-bar/nav-bar-dashboard";
import { FormProvider } from '@/providers/form-provider';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  // Normalize pathname so that if a user visits "/shopSetup", it becomes "/partnership/setup-shop"
  const normalizedPathname = router.pathname === "/shopSetup" ? routes.shopSetup : router.pathname;

  let title = 'Hue-Fit';
  let NavBarComponent = NavbarMain;
  let customStyle = '';
  let divClassName = 'flex flex-col justify-center items-center';

  // Hide Navbar on shop setup/status pages, virtual fitting mobile routes, and the /test route.
  const hideNavbarPaths = [routes.shopSetup, routes.shopStatus, routes.shopSuccess, '/test'];
  const isNavbarHidden = hideNavbarPaths.includes(normalizedPathname);
  const isVirtualFittingMobile = normalizedPathname.startsWith(routes.virtualFittingMobile);

  if (!isVirtualFittingMobile) {
    if (normalizedPathname.startsWith(routes.account)) {
      NavBarComponent = NavbarAccount;
    } else if (normalizedPathname.startsWith(routes.dashboard)) {
      NavBarComponent = NavbarDashboard;
      divClassName = 'flex flex-col items-start ml-[16.5rem]';
    }
  } else {
    divClassName = 'flex flex-col justify-center items-center w-full h-full';
  }

  return (
    <SessionProvider session={session}>
      <FormProvider>        
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className={`${GeistSans.className} ${customStyle}`}>
            <Head>
              <title>{title}</title> 
            </Head>
            {normalizedPathname === '/404' ? (
              <div>
                <Component {...pageProps} />
              </div>
            ) : (
              <>
                {!isVirtualFittingMobile && !isNavbarHidden && <NavBarComponent />}
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
