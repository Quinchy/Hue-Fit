import "@/styles/globals.css";
import { GeistSans } from 'geist/font/sans';
import Head from 'next/head';
import routes from "@/routes";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
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

  useEffect(() => {
    // Reset the background style for body by default
    document.body.style.background = 'var(--dark-background)';

    // Set specific background styles based on route
    if (router.pathname.startsWith(routes.account) || router.pathname.startsWith(routes.admin) || router.pathname.startsWith(routes.vendor)) {
      document.body.style.background = 'var(--light-background)';
      document.body.style.color = 'var(--dark)';
    }

    // Cleanup function to remove any inline styles when component unmounts or route changes
    return () => {
      document.body.style.background = 'var(--dark-background)'; // Reset to default on route change
    };
  }, [router.pathname]);
  // Handle 404
  if (router.pathname === '/404') {
    // Return only the Component (404 page) without navbar or styling
    return (
      <div>
        <Component {...pageProps} />
      </div>
    );
  }
  if (router.pathname.startsWith(routes.account)) {
    title = 'Hue-Fit - Login';
    NavBarComponent = NavbarAccount;
    customStyle = '';
    divClassName = '';
  } 
  else if (router.pathname.startsWith(routes.admin)) {
    title = 'Hue-Fit - Admin';
    NavBarComponent = NavbarAdmin;
    customStyle = '';
    divClassName = '';
  } 
  else if (router.pathname.startsWith(routes.vendor)) {
    title = 'Hue-Fit - PMS';
    NavBarComponent = NavbarVendor;
    customStyle = '';
    divClassName = '';
  }

  return (
    <main className={`${GeistSans.className} ${customStyle}`}>
      <NavBarComponent />
      <Head>
        <title>{title}</title> 
      </Head>
      <div className={divClassName ? divClassName : ''}>
        <Component {...pageProps} />
      </div>
    </main>
  );
}
