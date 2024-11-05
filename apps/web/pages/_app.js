// _app.js
import "@/styles/globals.css";
import { GeistSans } from 'geist/font/sans';
import Head from 'next/head';
import routes from "@/routes";
import { useRouter } from 'next/router';
import { SessionProvider} from "next-auth/react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NavbarMain from "@/components/ui/nav-bar/nav-bar-main";
import NavbarAccount from "@/components/ui/nav-bar/nav-bar-account";
import NavbarDashboard from "@/components/ui/nav-bar/nav-bar-dashboard";
import { PermissionProvider } from '@/providers/permission-provider'; // Import PermissionProvider

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  let title = 'Hue-Fit';
  let NavBarComponent = NavbarMain;
  let customStyle = '';
  let divClassName = 'mx-24 flex flex-col justify-center items-center';

  if (router.pathname.startsWith(routes.account)) {
    NavBarComponent = NavbarAccount;
  } 
  else if (router.pathname.startsWith(routes.dashboard)) {
    NavBarComponent = NavbarDashboard;
    divClassName = 'flex flex-col items-start ml-[22rem]';
  } 

  return (
    <SessionProvider session={session}>
      <PermissionProvider> {/* Wrap in PermissionProvider */}
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
      </PermissionProvider>
    </SessionProvider>
  );
}