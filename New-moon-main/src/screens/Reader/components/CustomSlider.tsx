import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface CustomSliderProps {
  value: number;
  onValueChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  activeColor?: string;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  activeColor = '#4a7cc7',
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) setSliderWidth(containerRef.current.clientWidth);
    const handleResize = () => setSliderWidth(containerRef.current?.clientWidth || 0);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderWidth) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let newVal = min + (x / sliderWidth) * (max - min);
    if (step) newVal = Math.round(newVal / step) * step;
    newVal = Math.min(max, Math.max(min, newVal));
    onValueChange(newVal);
  };

  return (
    <div ref={containerRef} className="relative flex-1 h-6 cursor-pointer" onClick={handleClick}>
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-800 rounded-full" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
        style={{ width: `${percentage}%`, backgroundColor: activeColor }}
      />
      <motion.div
        className="absolute top-1/2 w-4 h-4 rounded-full bg-white shadow-md border border-gray-600"
        style={{ left: `${percentage}%`, transform: 'translate(-50%, -50%)' }}
        whileHover={{ scale: 1.2 }}
        transition={{ type: 'spring', stiffness: 500 }}
      />
    </div>
  );
};