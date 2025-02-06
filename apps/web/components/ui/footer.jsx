// components/Footer.js
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import routes from "@/routes";
import HueFitLogo from "@/public/images/HueFitLogo";
import { Facebook, Twitter, Instagram } from "lucide-react";
import XIcon from "@/public/images/Xicon"; // Import the SVG Component

const MotionLink = motion(Link);

const socialLinkClasses = 
  "border-[1px] p-3 border-primary/50 rounded-full flex flex-col items-center justify-center transition-colors duration-300 hover:border-primary";

const navLinkClasses =
  "transition-colors duration-300 hover:text-primary items-center justify-center flex flex-col text-primary/75";

const Footer = ({ bgClass = "bg-card", className = "" }) => {
  return (
    <footer className={`flex flex-col items-center gap-10 justify-between w-full pt-40 pb-5 border-t-2 ${bgClass} ${className}`}>
      <div className="w-full flex flex-row justify-between items-center px-24">
        <div className='flex flex-row items-center gap-5'>
          <Link href={routes.home}>
            <HueFitLogo height={50} className="fill-primary" />
          </Link>

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
            <XIcon size={25} strokeWidth={2} strokeColor="white" className="stroke-primary/75" />
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

        <div className="flex flex-row justify-center gap-5">
          <MotionLink href={routes.home} className={navLinkClasses} whileHover={{ scale: 1.05 }} whileTap={{ scale: 1.15, transition: { type: 'spring', stiffness: 300, damping: 10 } }}>
            Home
          </MotionLink>
          <MotionLink href={routes.about} className={navLinkClasses} whileHover={{ scale: 1.05 }} whileTap={{ scale: 1.15, transition: { type: 'spring', stiffness: 300, damping: 10 } }}>
            About
          </MotionLink>
          <MotionLink href={routes.contact} className={navLinkClasses} whileHover={{ scale: 1.05 }} whileTap={{ scale: 1.15, transition: { type: 'spring', stiffness: 300, damping: 10 } }}>
            Contact
          </MotionLink>
          <MotionLink href={routes.partnership} className={navLinkClasses} whileHover={{ scale: 1.05 }} whileTap={{ scale: 1.15, transition: { type: 'spring', stiffness: 300, damping: 10 } }}>
            Partnership
          </MotionLink>
        </div>
      </div>

      <div className="flex gap-5 text-xs text-primary/50">
        <p>© 2024 Hue-Fit Technology Inc and Other Affiliates. All Rights Reserved.</p>
        <p>Terms of Use</p>
        <p>Privacy Policy</p>
      </div>
    </footer>
  );
};

export default Footer;
