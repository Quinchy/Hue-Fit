import Link from 'next/link';
import routes from '@/routes';
import HueFitLogo from '@/public/images/HueFitLogo';
import ArrowUpRight from '@/public/icons/ArrowUpRight';
import { ModeToggle } from "@/components/ui/mode-toggle";
import { buttonVariants } from "@/components/ui/button"

const NavbarMain = () => {
  return (
    <div className='w-full flex flex-row items-center text-sm justify-between px-24 bg-oneOpacityWhite h-[100px] border-b-2 border-border backdrop-blur-[5px] fixed z-50'>
      <Link href={routes.home}>
        <HueFitLogo 
          height={50}
          className="fill-primary" 
        />
      </Link>
      <nav className="flex flex-row items-center gap-10 uppercase">
        <div className="group">
          <Link className="text-primary tracking-widest font-medium pr-3 text-left block duration-500 ease-in-out" href={routes.home}>Home</Link>
          <div className="h-[2px] bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] w-0 transition-all duration-700 ease-&lsqb;cubic-bezier(.99,0,.11,1)&rsqb; group-hover:w-full"></div>
        </div>
        <div className="group">
          <Link className="text-primary tracking-widest font-medium pr-3 text-left block duration-500 ease-in-out" href={routes.about}>About</Link>
          <div className="h-[2px] bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] w-0 transition-all duration-700 ease-&lsqb;cubic-bezier(.99,0,.11,1)&rsqb; group-hover:w-full"></div>
        </div>
        <div className="group">
          <Link className="text-primary tracking-widest font-medium pr-3 text-left block duration-500 ease-in-out" href={routes.contact}>Contact</Link>
          <div className="h-[2px] bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] w-0 transition-all duration-700 ease-&lsqb;cubic-bezier(.99,0,.11,1)&rsqb; group-hover:w-full"></div>
        </div>
        <div className='flex flex-row items-center gap-5'>
          <Link
            className={`${buttonVariants({ variant: "default" })} !text-base !font-bold pl-[2.25rem] pr-[1.75rem] py-2 border-muted/30 border-2 shadow-primary/25 shadow-md`}
            href={routes.login}
          >
            <p className="uppercase tracking-widest">Dashboard</p>
          </Link>
          <ModeToggle/>
        </div>
      </nav>

    </div>
  );
};

export default NavbarMain;