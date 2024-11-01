import "@/styles/globals.css";
import { GeistSans } from 'geist/font/sans';
import Head from 'next/head';
import routes from "@/routes";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ThemeProvider } from "@/components/ui/theme-provider";
import NavbarMain from "@/components/ui/nav-bar/nav-bar-main";
import NavbarAccount from "@/components/ui/nav-bar/nav-bar-account";
import NavbarAdmin from "@/components/ui/nav-bar/nav-bar-admin";
import NavbarVendor from "@/components/ui/nav-bar/nav-bar-vendor";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Define your dynamic content based on route
  let title = 'Hue-Fit';
  let NavBarComponent = NavbarMain;
  let customStyle = '';
  let divClassName = 'mx-24 flex flex-col justify-center items-center';

  if (router.pathname.startsWith(routes.account)) {
    NavBarComponent = NavbarAccount;
  } 
  else if (router.pathname.startsWith(routes.admin)) {
    NavBarComponent = NavbarAdmin;
  } 
  else if (router.pathname.startsWith(routes.vendor)) {
    NavBarComponent = NavbarVendor;
  }

  return (
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
        {router.pathname === '/404' ? (
          <div>
            <Component {...pageProps} />
          </div>
        ) : (
          <>
            <NavBarComponent />
            <div className={divClassName ? divClassName : ''}>
              <Component {...pageProps} />
            </div>
          </>
        )}
      </main>
    </ThemeProvider>
  );
}
