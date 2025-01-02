import Lottie from "lottie-react";
import hueFitLoading from "@/public/animations/hue-fit-loading.json";

export default function Loading({ message = "Loading...", speed = 1.5 }) {
  return (
    <div className="flex flex-col justify-center items-center mt-[9.5rem]">
      <Lottie
        animationData={hueFitLoading}
        loop
        style={{ width: 500, height: 500 }}
        // This prop may or may not work directly in lottie-react. 
        // If not, consider adjusting the 'fr' or keyframes inside the JSON directly.
        speed={speed}
      />
      <p className="-mt-[8.5rem] opacity-50 tracking-wider font-bold">
        {message}
      </p>
    </div>
  );
}
