import Link from 'next/link';
import routes from '@/routes';
import HueFitLogo from '@/public/images/HueFitLogo';

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center gap-16 min-h-screen">
      <div className='flex flex-col items-center gap-5'>
        <HueFitLogo 
          className="fill-white"
        />
        <div className='flex  flex-col items-center'>
          <h1 className="text-6xl font-bold bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] bg-clip-text text-transparent">404</h1>
          <h2 className="text-3xl uppercase bg-[linear-gradient(90deg,_var(--rainbow1)_0%,_var(--rainbow2)_20%,_var(--rainbow3)_40%,_var(--rainbow4)_60%,_var(--rainbow5)_80%,_var(--rainbow6)_100%)] bg-clip-text text-transparent">Page Not Found.</h2>
        </div>
        <div className='flex flex-col items-center'>
          <p className="text-xl font-thin text-white uppercase">Oops! Looks like someone got lost trying to find the right style. </p>
          <p className="text-xl font-thin text-white uppercase">Let's get back on track and find your perfect fit!</p>
        </div>
      </div>
      <Link className="flex flex-row gap-3 items-center border rounded px-20 py-3 text-white uppercase hover:text-grey hover:border-grey duration-300 ease-in-out" href={routes.home}>
        <p className='font-black text-xl'>←</p> Back to Home
      </Link>
    </div>
  );
}
