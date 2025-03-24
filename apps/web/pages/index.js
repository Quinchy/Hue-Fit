"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/ui/index/hero";
import Section1 from "@/components/ui/index/section-1";
import BrandShowcase from "@/components/ui/index/brand-showcase";
import Section2 from "@/components/ui/index/section-2";
import Section3 from "@/components/ui/index/section-3";
import Footer from "@/components/ui/footer";

function BgContainer({ children }) {
  return <div className="bg-pure z-50 relative">{children}</div>;
}

export default function Home() {
  return (
    <>
      <div className="flex flex-col w-full gap-[20rem] mt-[6.5rem]">
        <Hero />
        <BgContainer>
          <BrandShowcase />
          <Section1 />
          <Section2 />
          <Section3 />
          <Footer bgClass="bg-pure" />
        </BgContainer>
      </div>
    </>
  );
}
