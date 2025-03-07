"use client";

import Hero from "@/components/ui/index/hero";
import Section1 from "@/components/ui/index/section-1";
import Section2 from "@/components/ui/index/section-2";
import Section3 from "@/components/ui/index/section-3";
import Footer from "@/components/ui/footer";

export default function Home() {
  return (
    <>
      <div className="flex flex-col w-[100%] px-[15rem] gap-[30rem] mt-[15rem] mb-[15rem]">
        <Hero />
        <Section1 />
        <Section2 />
      </div>
      <Section3 />
      <Footer bgClass="bg-pure" />
    </>
  );
}
