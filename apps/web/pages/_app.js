import "@/styles/globals.css";
import { GeistSans } from 'geist/font/sans';

export default function App({ Component, pageProps }) {
  return (
    <main className={`${GeistSans.className} mx-24 flex flex-col justify-center items-center`}>
      <Component {...pageProps} />
    </main>
  );
}
