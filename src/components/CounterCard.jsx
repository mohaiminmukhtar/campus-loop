import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import "../styles/CounterCard.css";

export default function CounterCard({ icon, end, label, color }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 50);
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(counter);
        }
        setCount(Math.floor(start));
      }, 50);
    }
  }, [inView, end]);

  return (
    <div ref={ref} className="counter-card">
      <div className="counter-icon" style={{ color }}>
        {icon}
      </div>
      <div className="counter-value">
        {count.toLocaleString()}
      </div>
      <p className="counter-label">
        {label}
      </p>
    </div>
  );
}
