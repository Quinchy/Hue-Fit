import { Button } from "@/components/ui/button";
import { Gloock } from "next/font/google";
import { ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button"
import routes from '@/routes';

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
          DISCOVER <br /> <p className="bg-[linear-gradient(90deg,_var(--rainbow1)_15%,_var(--rainbow2)_20%,_var(--rainbow3)_30%,_var(--rainbow4)_40%,_var(--rainbow5)_55%,_var(--rainbow6)_90%)] bg-clip-text text-transparent">
          YOUR STYLE
          </p>
        </h1>
        <p className="uppercase font-thin text-lg w-[100%] text-[1.25rem] text-primary text-center">
          {"Hue-fit is a modern men's apparel online shopping platform that leverage Artificial Intelligence to"}
          <br />
          {"help find the best outfit for you based on your physical features, and Augmented Reality technology"}
          <br />
          {"for vistual fitting, to ensure that you already know the outfit matches your looks."}
        </p>
        <div className="flex flex-row items-center gap-5">
          <Button className="text-base font-medium flex flex-row pl-[4rem] pr-[3.5rem] py-7 border-muted/30 border-2 rounded-lg shadow-primary/25 shadow-md mb-20 mt-16 min-w-[20rem]" > 
            <p className="uppercase tracking-widest">Try Hue-Fit</p> <Download className="scale-115 mb-[2px]" width={30} height={30} />
          </Button>
          <Link
            className={`${buttonVariants({ variant: "outline" })} !text-base !font-medium flex flex-row pl-[4rem] pr-[3.5rem] py-7 shadow-primary/25 shadow-md mb-20 mt-16 min-w-[20rem]`}
            href={routes.partnership}
          >
            <p className="uppercase tracking-widest">Partner With Us</p>
            <ArrowUpRight className="scale-125 mb-[2px]" width={30} height={30} />
          </Link>
        </div>
      </div>
    </div>
  );
}
