import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";



interface CountUpNumberProps {
  value: number;
  suffix?: string;
  duration?: number;
}

const CountUpNumber: React.FC<CountUpNumberProps> = ({ value, suffix = "", duration = 1.5 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      let start = 0;
      const step = value / (duration * 60); // For 60fps over duration seconds

      const timer = setInterval(() => {
        start = Math.min(start + step, value);
        setCount(Math.floor(start));

        if (start >= value) {
          clearInterval(timer);
        }
      }, 1000 / 60);

      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{inView ? count : 0}{suffix}</span>;
};


export default CountUpNumber;