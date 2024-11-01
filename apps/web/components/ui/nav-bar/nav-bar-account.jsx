import Link from 'next/link';
import routes from '@/routes';
import HueFitLogo from '@/public/images/HueFitLogo';
import ArrowUpRight from '@/public/icons/ArrowUpRight';
import { ModeToggle } from "@/components/ui/mode-toggle";
import { buttonVariants } from "@/components/ui/button"

const NavbarAccount = () => {
  return (
    <div className='w-full flex flex-row items-center justify-between px-24 h-[100px] fixed'>
      <Link href={routes.home}>
        <HueFitLogo 
          height={50}
          className="fill-primary" 
        />
      </Link>
      <div className='flex flex-row items-center gap-5'>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href={routes.partnership}
        >
          <p className="tracking-widest">Visit Hue-Fit Website</p>
          <ArrowUpRight width={20} height={20}/>
        </Link>
        <ModeToggle/>
      </div>
    </div>
  );
};

export default NavbarAccount;