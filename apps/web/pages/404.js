import Link from 'next/link';
import routes from '@/routes';
import HueFitLogo from '@/public/images/HueFitLogo';
import { buttonVariants } from "@/components/ui/button"

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center gap-16 min-h-screen">
      <div className='flex flex-col items-center gap-5'>
        <HueFitLogo 
          className="fill-primary"
        />
        <div className='flex  flex-col items-center'>
          <h1 className="text-6xl font-black bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] bg-clip-text text-transparent">404</h1>
          <h2 className="text-3xl font-bold uppercase bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] bg-clip-text text-transparent">Page Not Found</h2>
        </div>
        <div className='flex flex-col items-center'>
          <p className="text-xl uppercase">Oops! Looks like someone got lost trying to find the right style. </p>
          <p className="text-xl uppercase">{"Let's get back on track and find your perfect fit!"}</p>
        </div>
      </div>
      <Link 
        className={buttonVariants({ variant: "outline" })}
        href={routes.home}
      >
        Back to Home
      </Link>
    </div>
  );
}
