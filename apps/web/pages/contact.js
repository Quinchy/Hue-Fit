"use client";

import ContactForm from "@/components/ui/contact/contact-form";
import Footer from "@/components/ui/footer";
import { LenisProvider } from "@/providers/lenis-provider";

export default function Contact() {
  return (
    <>
      <LenisProvider options={{
        duration: 1.75,
      }}>        
        <div className="flex flex-col w-full mt-[5rem] gap-[5rem]">
          <ContactForm />
        </div>
        <Footer bgClass="bg-pure" />
      </LenisProvider>
    </>
  );
}
