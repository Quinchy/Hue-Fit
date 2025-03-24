import { useMemo } from "react";
import { motion } from "motion/react";
import Image from "next/image";

function ShrinkingImage({ src, alt, className = "", quality = 100 }) {
  // Generate a random delay between 0 and 0.5 seconds for the appearance animation.
  const randomDelay = useMemo(() => Math.random() * 0.5, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: randomDelay, duration: 0.25 }}
      className={`aspect-square ${className}`}
    >
      {/* Image under the overlay */}
      <Image
        src={src}
        alt={alt}
        fill
        quality={quality}
        style={{ objectFit: "cover" }}
        className="ease-in-out duration-500 saturate-100 select-none -z-20"
      />
    </motion.div>
  );
}

export default ShrinkingImage;
