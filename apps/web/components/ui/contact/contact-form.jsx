"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Asterisk } from "lucide-react";
import { Gloock } from "next/font/google";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

const MotionLink = motion(Link);

const socialLinkClasses = 
  "border-[1px] p-3 border-primary/50 rounded-full flex flex-col items-center justify-center transition-colors duration-300 hover:border-primary";

const navLinkClasses =
  "transition-colors duration-300 hover:text-primary";

export default function ContactForm() {
  return (
    <div className="flex flex-col gap-20 relative px-[15rem]">
      <div className="flex flex-col gap-20">
        <h1 className={`text-[8rem] text-primary font-black subpixel-antialiased tracking-tight text-start leading-[7rem] ${gloock.className}`}>
          {"QUESTIONS ON STYLE? ASK AWAY!"}
        </h1>
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <Card className="w-[55%]">
            <form>
              <div className="flex flex-col gap-10">
                <div>
                  <CardTitle className="text-3xl">{"Get In Touch"}</CardTitle>
                  <p className="font-light text-primary/75">{"Have a question or need help? Contact us, and we'll respond shortly!"}</p>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="email" className="font-bold flex flex-row items-center">
                      Email <Asterisk className="w-4" />
                    </Label>
                    <Input id="email" type="email" placeholder="Your Email" />
                  </div>
                  <div className="flex flex-col gap-1"> 
                    <Label htmlFor="subject" className="font-bold flex flex-row items-center">
                      Subject <Asterisk className="w-4" />
                    </Label>
                    <Input id="subject" type="text" placeholder="Your Subject" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="message" className="font-bold flex flex-row items-center">
                      Message <Asterisk className="w-4" />
                    </Label>
                    <Textarea id="message" rows={5} placeholder="Your Message" />
                  </div>
                </div>
                <Button type="submit">
                  Submit
                </Button>
              </div>
            </form>
          </Card>
          <div className="w-[45%] flex flex-col gap-10">
            <div className="flex flex-col gap-5">            
              <div className="flex items-center gap-4">
                <MapPin width={30} height={30} className="stroke-1"/>
                <CardTitle className="text-xl">BONIFACIO GLOBAL CITY, TAGUIG</CardTitle>
              </div>
              <div className="flex items-center gap-4">
                <Phone width={30} height={30} className="stroke-1"/>
                <CardTitle className="text-xl">+63 917 123 4567</CardTitle>
              </div>
              <div className="flex items-center gap-4">
                <Mail width={30} height={30} className="stroke-1"/>
                <CardTitle className="text-xl">inquiries@huefitstyle.com</CardTitle>
              </div>
            </div>
            <div className="flex flex-row justify-start min-w-[15rem] gap-5">
              <MotionLink
                href=""
                className={socialLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{ 
                  scale: 1.15,
                  transition: { type: 'spring', stiffness: 300, damping: 10 },
                }}
              >
                <Facebook className="stroke-1" />
              </MotionLink>
              <MotionLink
                href=""
                className={socialLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{ 
                  scale: 1.15,
                  transition: { type: 'spring', stiffness: 300, damping: 10 },
                }}
              >
                <Twitter className="stroke-1" />
              </MotionLink>
              <MotionLink
                href=""
                className={socialLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{ 
                  scale: 1.15,
                  transition: { type: 'spring', stiffness: 300, damping: 10 },
                }}
              >
                <Instagram className="stroke-1" />
              </MotionLink>
            </div>
          </div>
        </div>
        <div className="h-[5rem]"></div>
      </div>
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: 'linear-gradient(to top, hsl(var(--pure)) 0%, transparent 100%)'
        }}
      />
    </div>
  );
}
