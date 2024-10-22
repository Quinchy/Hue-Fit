import Link from 'next/link';
import routes from '@/routes';
import HueFitLogo from '@/public/images/HueFitLogo';
import ArrowUpRight from '@/public/icons/ArrowUpRight';

const NavbarMain = () => {
  return (
    <div className='w-full flex flex-row items-center text-greyWhite text-sm justify-between px-24 bg-oneOpacityWhite h-[100px] border-b border-tenOpacityWhite backdrop-blur-[1px] fixed'>
      <Link href={routes.home}>
        <HueFitLogo 
          height={50}
          className="fill-white" 
        />
      </Link>
      <nav className="flex flex-row items-center gap-10 uppercase">
        <div className="group">
          <Link className="group-hover:text-white tracking-widest pr-3 text-left block duration-500 ease-in-out" href={routes.home}>Home</Link>
          <div className="h-[2px] bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] w-0 transition-all duration-700 ease-[cubic-bezier(.99,0,.11,1)] group-hover:w-full"></div>
        </div>
        <div className="group">
          <Link className="group-hover:text-white tracking-widest pr-3 text-left block duration-500 ease-in-out" href={routes.about}>About</Link>
          <div className="h-[2px] bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] w-0 transition-all duration-700 ease-[cubic-bezier(.99,0,.11,1)] group-hover:w-full"></div>
        </div>
        <div className="group">
          <Link className="group-hover:text-white tracking-widest pr-3 text-left block duration-500 ease-in-out" href={routes.contact}>Contact</Link>
          <div className="h-[2px] bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] w-0 transition-all duration-700 ease-[cubic-bezier(.99,0,.11,1)] group-hover:w-full"></div>
        </div>
        <Link
          className="flex flex-row gap-2 items-center border border-lowGrey rounded px-6 py-3 duration-300 ease-[cubic-bezier(.99,0,.11,1)] hover:text-white hover:border-white group"
          href={routes.partnership}
        >
          <p className="pt-[1px] tracking-widest">Partner With Us</p>
          <ArrowUpRight className="transform transition-transform duration-300 ease-[cubic-bezier(.99,0,.11,1)] group-hover:scale-105 group-hover:-translate-y-[1px] group-hover:translate-x-[1px]" width={20} height={20} />
        </Link>
      </nav>

    </div>
  );
};

export default NavbarMain;