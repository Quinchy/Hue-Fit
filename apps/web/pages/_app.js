import "@/styles/globals.css";
import { GeistSans } from 'geist/font/sans';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <main className={`${GeistSans.className} mx-24 flex flex-col justify-center items-center`}>
      <Head>
        <title>Hue-Fit</title> 
      </Head>
      <Component {...pageProps} />
    </main>
  );
}
