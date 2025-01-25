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
import { PermissionProvider } from '@/providers/permission-provider'; 
import { FormProvider } from '@/providers/form-provider';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  let title = 'Hue-Fit';
  let NavBarComponent = NavbarMain;
  let customStyle = '';
  let divClassName = 'flex flex-col justify-center items-center';

  // Check if the current route is 'virtualFittingMobile'
  const isVirtualFittingMobile = router.pathname.startsWith(routes.virtualFittingMobile);

  if (!isVirtualFittingMobile) {
    if (router.pathname.startsWith(routes.account)) {
      NavBarComponent = NavbarAccount;
    } 
    else if (router.pathname.startsWith(routes.dashboard)) {
      NavBarComponent = NavbarDashboard;
      divClassName = 'flex flex-col items-start ml-[22rem]';
    }
  } else {
    // Optionally, adjust divClassName or other styles for 'virtualFittingMobile'
    divClassName = 'flex flex-col justify-center items-center w-full h-full';
  }

  return (
    <SessionProvider session={session}>
      <FormProvider>        
        <PermissionProvider>
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
                  {/* Render Navbar only if not on 'virtualFittingMobile' route */}
                  {!isVirtualFittingMobile && <NavBarComponent />}
                  <div className={divClassName ? divClassName : ''}>
                    <Component {...pageProps} />
                  </div>
                </>
              )}
            </main>
          </ThemeProvider>
        </PermissionProvider>
      </FormProvider>
    </SessionProvider>
  );
}
