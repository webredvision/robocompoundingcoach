"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const radius = 100; // radius of the hover/touch effect
  const [visible, setVisible] = React.useState(false);

  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  const handleMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMove({
        currentTarget: e.currentTarget,
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
    }
  };

  return (
    <motion.div
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
            transparent 80%
          )
        `,
      }}
      onMouseMove={handleMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={() => setVisible(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setVisible(false)}
      className="p-[2px] rounded-lg transition duration-300 group/input"
    >
      <input
        type={type}
        className={cn(
          `flex h-12 w-full border-[1px] border-[var(--rv-primary)] bg-transparent shadow-input rounded-md px-3 py-4 text-sm 
           file:border-1 file:bg-transparent file:text-sm file:font-medium 
           placeholder:text-neutral-600 focus-visible:outline-none focus-visible:border-[var(--rv-primary)] disabled:cursor-not-allowed disabled:opacity-50 
           dark:shadow-[0px_0px_1px_1px_var(--neutral-700)] group-hover/input:shadow-none 
           transition duration-400`,
          className
        )}
        ref={ref}
        {...props}
      />
    </motion.div>
  );
});
Input.displayName = "Input";

export { Input };
