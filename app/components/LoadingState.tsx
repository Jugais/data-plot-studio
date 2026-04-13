// src/components/LoadingState.tsx
"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const LoadingState = () => {

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const calcLoadTime = (t: number) => { return t * 1000 / 100 };
    const timer = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : 100));
    }, calcLoadTime(1));
    return () => clearInterval(timer);
  }, [])

  const total = 100;
  const radius = 150;
  const circleCenter = radius + 10;
  const circum = 2 * Math.PI * radius;
  const strokeDashOffset = circum - (progress / total) * circum;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg width={circleCenter * 2} height={circleCenter * 2} className="transform -rotate-90">
          <circle
            cx={circleCenter} cy={circleCenter} r={radius}
            stroke="#F1F5F9" strokeWidth="1" fill="transparent"
          />
          <motion.circle
            cx={circleCenter} cy={circleCenter} r={radius}
            stroke="#1A212B" strokeWidth="1.2"
            fill="transparent"
            strokeDasharray={circum}
            initial={{ strokeDashoffset: circum }}
            animate={{ strokeDashoffset: strokeDashOffset }}
            transition={{ duration: 0.1, ease: "linear" }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl text-slate-900">
            {progress} <span className="text-sm ml-0.5">%</span>
          </span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 text-sm text-slate-400 font-medium"
          >
            Progressing...
          </motion.span>
        </div>
      </div>
    </div>
  )
}
