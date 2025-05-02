import Hero from "@/components/ui/about/hero";
import Section1 from "@/components/ui/about/section-1";
import Section2 from "@/components/ui/about/section-2";
import Section3 from "@/components/ui/index/section-3";
import Footer from "@/components/ui/footer";
import { LenisProvider } from "@/providers/lenis-provider";

export default function About() {
  return (
    <>
      <LenisProvider options={{
        duration: 1.75,
      }}>
        <div className="flex flex-col w-[100%] gap-96 mb-56">
          <Hero />
          <Section1 />
          <Section2 />
        </div>
        <Section3 />
        <Footer bgClass="bg-pure" />
      </LenisProvider>
    </>
  );
}
