// components/Footer.js
import React from 'react';
import Link from 'next/link';
import routes from '@/routes';
import HueFitLogo from '@/public/images/HueFitLogo';
import { Facebook } from 'lucide-react';
import { Twitter } from 'lucide-react';
import { Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="flex flex-col items-center gap-10 justify-between w-full pt-40 pb-5 bg-card border-t-2">
      <div className='flex flex-row gap-64 items-center'>
        <Link href={routes.home} className='flex justify-center min-w-[15rem]'>
          <HueFitLogo 
            height={50}
            className="fill-primary" 
          />
        </Link>
        <div className='flex flex-row justify-center min-w-[15rem] gap-5'>
          <Link href="" className='border-[1px] p-3 border-primary/50 rounded-full flex flex-col items-center justify-center'>
            <Facebook className="stroke-1" />
          </Link>
          <Link href="" className='border-[1px] p-3 border-primary/50 rounded-full flex flex-col items-center justify-center'>
            <Twitter className="stroke-1"/>
          </Link>
          <Link href="" className='border-[1px] p-3 border-primary/50 rounded-full flex flex-col items-center justify-center'>
            <Instagram className="stroke-1"/>
          </Link>
        </div>
        <div className='flex flex-row justify-center gap-5 min-w-[15rem]'>
          <Link href={routes.home}>Home</Link>
          <Link href={routes.about}>About</Link>
          <Link href={routes.contact}>Contact</Link>
        </div>
      </div>
      <div className='flex gap-5 text-xs text-primary/50'>
        <p>© 2024 Hue-Fit Technology Inc and Other Affiliates. All Rights Reserved.</p>
        <p>Terms of Use</p>
        <p>Privacy Policy</p>
      </div>
    </footer>
  );
};

export default Footer;
