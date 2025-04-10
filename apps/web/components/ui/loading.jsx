import Lottie from "lottie-react";
import hueFitLoading from "@/public/animations/hue-fit-loading.json";

export default function Loading({ message = "Loading...", speed = 1.5 }) {
  return (
    <div className="flex flex-col justify-center items-center mt-[9.5rem] overflow-hidden">
      <div className="invert dark:invert-0">
        <Lottie
          animationData={hueFitLoading}
          loop
          style={{ width: 500, height: 500 }}
          speed={speed}
        />
      </div>
      <p className="-mt-[8.5rem] tracking-wider font-bold text-primary">
        {message}
      </p>
    </div>
  );
}
