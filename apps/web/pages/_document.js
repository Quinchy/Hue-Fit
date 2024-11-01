import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased bg-[image:var(--background-image)]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
