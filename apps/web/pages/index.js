import { Button } from "@/components/ui/button";
import { Gloock } from "next/font/google";
import { ArrowUpRight } from "lucide-react";

const gloock = Gloock({ 
  style: ['normal'],
  weight: ['400'],
  subsets: ['latin'],
});

export default function Home() {
  
  return (
    <div className="mt-[16rem]">
      <div className="flex flex-col items-center gap-4">
        <h1 className={`text-[8rem] text-primary font-black subpixel-antialiased tracking-tight text-center leading-[7rem] ${gloock.className}`}>
          DISCOVER <br /> <p className="bg-[linear-gradient(90deg,_var(--rainbow1)_15%,_var(--rainbow2)_20%,_var(--rainbow3)_30%,_var(--rainbow4)_40%,_var(--rainbow5)_55%,_var(--rainbow6)_70%)] bg-clip-text text-transparent">
          YOUR STYLE
          </p>
        </h1>
        <p className="uppercase font-thin text-lg w-[49%] text-[1.25rem] text-center">
          Hue-fit is a mobile app that uses Artificial intelligence to recommend outfits, 
          from upper wear to footwear tailored to your unique features, helping your look and feel your best.
        </p>
        <Button className="text-base flex flex-row pl-[4rem] pr-[3.5rem] py-7 border-muted/30 border-2 rounded-lg shadow-primary/25 shadow-md mb-20 mt-16" > Try Hue-Fit <ArrowUpRight className="scale-150 mb-[2px]" width={30} height={30} /></Button>
        
        <div className="h-[20rem] w-[119rem] bg-gradient-to-t from-card to-transparent"></div>
      </div>
    </div>
  );
}
