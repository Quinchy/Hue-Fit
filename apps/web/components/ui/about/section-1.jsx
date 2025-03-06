"use client";

import { useState, useEffect } from "react";
import { Gloock } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image"; // Renamed import
import { MoveLeft, MoveRight } from "lucide-react";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

const infoItems = [
  {
    src: "/images/carousel-1.png",
    title: "AI-Powered Outfit Recommendation",
    desc: "Experience a truly personalized style journey with our advanced AI technology that curates unique outfit combinations just for you. It carefully analyzes your body type, style preferences, and current fashion trends to craft ensembles that elevate your look. Every recommendation is designed to ensure a flawless and confidence-boosting appearance. The system continuously learns from your feedback, refining its suggestions to perfectly match your evolving taste. With this innovative approach, discovering your next favorite outfit becomes both effortless and exciting.",
  },
  {
    src: "/images/carousel-2.png",
    title: "Skin Tone-Based Outfit Color Matching",
    desc: "Discover the art of perfect color coordination tailored to your unique skin tone. Our technology analyzes the subtle nuances of your complexion to provide expert recommendations on harmonious color pairings. It ensures that every outfit enhances your natural beauty while staying true to your personal aesthetic. Detailed insights into how different shades interact with your skin empower you to confidently choose ensembles that make a statement. Embrace a vibrant look that celebrates your individuality and radiates elegance.",
  },
  {
    src: "/images/carousel-3.png",
    title: "Effortless Ordering Process",
    desc: "Once your personalized outfit is generated, placing your order becomes a seamless experience. Our platform offers a user-friendly interface that allows you to finalize your selection with just a few clicks. Every step of the process is designed for efficiency and convenience, ensuring a hassle-free purchase. The integration with partnered retailers guarantees a smooth transition from outfit generation to doorstep delivery. Enjoy a stress-free shopping experience that makes high-quality fashion accessible at your fingertips.",
  },
  {
    src: "/images/carousel-4.png",
    title: "VIRTUAL FITTING ROOM",
    desc: "Step into the future of fashion with our immersive virtual fitting room experience. In this innovative environment, you can try on outfits in a realistic 3D simulation that adapts to your body shape and style. The detailed preview allows you to see how each garment fits and moves with you, ensuring a perfect match. This cutting-edge technology encourages experimentation with different styles and sizes, boosting your confidence in every selection. It transforms your shopping experience by merging convenience with advanced visual realism.",
  },
  {
    src: "/images/carousel-5.png",
    title: "Seamless Shopping Integration",
    desc: "Discover a unified shopping experience that brings together a variety of clothing shops into one convenient platform. Our system lets you effortlessly explore, compare, and purchase outfits from multiple trusted retailers. Intuitive navigation and personalized recommendations make the process both efficient and enjoyable. The seamless integration ensures a smooth checkout experience with reliable delivery timelines. Experience the ultimate convergence of technology and style that redefines online shopping.",
  },
];

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const revealVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function Section1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Preload images with the global window.Image constructor
  useEffect(() => {
    infoItems.forEach((item) => {
      const preloader = new window.Image();
      preloader.src = item.src;
    });
  }, []);

  const paginate = (newDirection) => {
    let newIndex = currentIndex + newDirection;
    if (newIndex < 0) {
      newIndex = infoItems.length - 1;
    } else if (newIndex >= infoItems.length) {
      newIndex = 0;
    }
    setDirection(newDirection);
    setCurrentIndex(newIndex);
  };

  const { src, title, desc } = infoItems[currentIndex];

  return (
    <div className="flex flex-col items-center justify-between gap-[10rem]">
      <h1
        className={`${gloock.className} text-[8rem] text-primary uppercase text-center font-black subpixel-antialiased tracking-tight leading-[7rem]`}
      >
        Discover the Power of Smart Fashion
      </h1>

      <motion.div
        className="relative flex flex-row items-center px-4 md:px-[10rem] h-auto md:h-[300px]"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
            }}
            className="flex flex-row gap-10 items-center"
          >
            <NextImage
              src={src}
              width={300}
              height={300}
              quality={100}
              className="rounded-2xl shadow-pure shadow-md min-w-[300px] max-w-[300px]"
              alt={title}
            />
            <div>
              <h2
                className={`${gloock.className} text-[2rem] text-primary uppercase text-start font-black subpixel-antialiased tracking-tight leading-[2.5rem]`}
              >
                {title}
              </h2>
              <p className="uppercase font-thin text-lg w-full text-[1.25rem] text-primary text-start">
                {desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="flex flex-row gap-5">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{
            scale: 1.15,
            transition: { type: "spring", stiffness: 300, damping: 10 },
          }}
          onClick={() => paginate(-1)}
          className="cursor-pointer border-[1px] p-3 border-primary/50 rounded-full flex items-center justify-center transition-colors duration-300 hover:border-primary"
        >
          <MoveLeft />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{
            scale: 1.15,
            transition: { type: "spring", stiffness: 300, damping: 10 },
          }}
          onClick={() => paginate(1)}
          className="cursor-pointer border-[1px] p-3 border-primary/50 rounded-full flex items-center justify-center transition-colors duration-300 hover:border-primary"
        >
          <MoveRight />
        </motion.div>
      </div>
    </div>
  );
}
