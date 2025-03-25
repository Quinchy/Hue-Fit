"use client";

import ContactForm from "@/components/ui/contact/contact-form";
import Footer from "@/components/ui/footer";

export default function Contact() {
  return (
    <>
      <div className="flex flex-col w-full mt-[10rem] gap-[5rem]">
        <ContactForm />
      </div>
      <Footer bgClass="bg-pure" />
    </>
  );
}
