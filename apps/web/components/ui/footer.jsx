// components/Footer.js
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import routes from "@/routes";
import HueFitLogo from "@/public/images/HueFitLogo";
import HueFitTextLogo from "@/public/images/HueFitLogoText";
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram } from "lucide-react";

import XIcon from "@/public/images/XIcon"; // Import the SVG Component

const MotionLink = motion(Link);

const socialLinkClasses = 
  "flex flex-col items-center justify-center p-2 rounded duration-300 hover:bg-muted";

const navLinkClasses =
  "transition-colors duration-300 hover:text-primary items-center justify-center flex flex-col text-primary/75";

const Footer = ({ bgClass = "bg-card", className = "" }) => {
  return (
    <footer
      className={`flex flex-col items-center gap-10 justify-between w-full pt-32 pb-10 px-8 sm:px-14 md:px-24 lg:px-32 xl:px-52 border-t-2 ${bgClass} ${className}`}
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-0 lg:justify-between items-center lg:items-start">
        <div className="flex flex-col items-center lg:items-start gap-3">
          <div className="flex flex-col items-center lg:items-start gap-5">
            <Link href={routes.home}>
              <HueFitLogo height={50} className="fill-primary" />
            </Link>
            <p className="max-w-[30rem] text-primary/75 ml-2 text-center text-sm md:text-base lg:text-start">
              Boosting {"men's"} confidence and redefining shopping with
              Artificial Intelligence and Augmented Reality.
            </p>
          </div>
          <div className="flex gap-2">
            <MotionLink
              href=""
              className={socialLinkClasses}
              whileHover={{ scale: 1.05 }}
              whileTap={{
                scale: 1.15,
                transition: { type: "spring", stiffness: 300, damping: 10 },
              }}
            >
              <Facebook className="stroke-primary/75 stroke-[2px] w-6 h-6 -translate-x-[0.05rem]" />
            </MotionLink>
            <MotionLink
              href=""
              className={socialLinkClasses}
              whileHover={{ scale: 1.05 }}
              whileTap={{
                scale: 1.15,
                transition: { type: "spring", stiffness: 300, damping: 10 },
              }}
            >
              <XIcon
                size={25}
                strokeWidth={2}
                strokeColor="white"
                className="stroke-primary/75 stroke-[2px] w-6 h-6 "
              />
            </MotionLink>
            <MotionLink
              href=""
              className={socialLinkClasses}
              whileHover={{ scale: 1.05 }}
              whileTap={{
                scale: 1.15,
                transition: { type: "spring", stiffness: 300, damping: 10 },
              }}
            >
              <Instagram className="stroke-primary/75 stroke-[2px] w-6 h-6 " />
            </MotionLink>
          </div>
        </div>
        <div className="flex flex-col min-[1598px]:flex-row items-center lg:items-start gap-14">
          <div className="flex flex-col items-center lg:items-start gap-2">
            <h1 className="text-base lg:text-lg font-bold">Quick Links</h1>
            <div className="flex text-sm md:text-base min-[1598px]:flex-col items-start gap-2">
              <MotionLink
                href={routes.home}
                className={navLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{
                  scale: 1.15,
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                Home
              </MotionLink>
              <MotionLink
                href={routes.about}
                className={navLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{
                  scale: 1.15,
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                About
              </MotionLink>
              <MotionLink
                href={routes.contact}
                className={navLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{
                  scale: 1.15,
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                Contact
              </MotionLink>
              <MotionLink
                href={routes.partnership}
                className={navLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{
                  scale: 1.15,
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                Partnership
              </MotionLink>
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-start gap-2">
            <h1 className="text-base lg:text-lg font-bold">About Us</h1>
            <div className="flex text-sm md:text-base min-[1598px]:flex-col items-start gap-2">
              <MotionLink
                href={routes.about}
                className={navLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{
                  scale: 1.15,
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                Company
              </MotionLink>
              <MotionLink
                href={routes.about}
                className={navLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{
                  scale: 1.15,
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                Features
              </MotionLink>
              <MotionLink
                href={routes.about}
                className={navLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{
                  scale: 1.15,
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                Goals and Purposes
              </MotionLink>
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-start gap-2">
            <h1 className="text-base lg:text-lg font-bold">Contact Info</h1>
            <div className="flex flex-col text-sm md:text-base  items-center lg:items-start gap-2">
              <div className="flex flex-row gap-2">
                <MapPin className="stroke-primary/75" />
                <p className="text-primary/75">
                  Bonifacio Global City, Taguig, Philippines
                </p>
              </div>
              <div className="flex flex-row gap-2">
                <Mail className="stroke-primary/75" />
                <p className="text-primary/75">inquiries@huefit.com</p>
              </div>
              <div className="flex flex-row gap-2">
                <Phone className="stroke-primary/75" />
                <p className="text-primary/75">+63 917 123 4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between items-center w-full text-xs text-primary/50">
        <p className="text-center">
          © 2024 Hue-Fit Technology Inc and Other Affiliates. All Rights
          Reserved.
        </p>
        <div className="flex gap-4">
          <Link
            href={routes.home}
            className="hover:underline hover:text-primary"
          >
            Terms of Use
          </Link>
          <Link
            href={routes.home}
            className="hover:underline hover:text-primary"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
