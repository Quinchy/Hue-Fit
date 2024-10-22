import Link from 'next/link';
import routes from '@/routes';
import HueFitLogo from '@/public/images/HueFitLogo';
import ArrowUpRight from '@/public/icons/ArrowUpRight';

const NavbarAccount = () => {
  return (
    <div className='w-full flex flex-row items-center text-sm justify-between px-24 h-[100px] fixed'>
      <Link href={routes.home}>
        <HueFitLogo 
          height={50}
          className="fill-dark" 
        />
      </Link>
        <Link
          className="flex flex-row gap-2 items-center border-2 border-grey rounded px-6 py-3 duration-300 ease-[cubic-bezier(.99,0,.11,1)] hover:text-black hover:border-black group"
          href={routes.partnership}
        >
          <p className="pt-[1px] text-grey uppercase font-bold tracking-widest group-hover:text-black duration-300 ease-[cubic-bezier(.99,0,.11,1)]">Visit Hue-Fit Website</p>
          <ArrowUpRight className="transform transition-transform duration-300 ease-[cubic-bezier(.99,0,.11,1)] group-hover:scale-105 group-hover:-translate-y-[1px] group-hover:translate-x-[1px]" width={20} height={20} />
        </Link>
    </div>
  );
};

export default NavbarAccount;