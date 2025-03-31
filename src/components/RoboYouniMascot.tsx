import Image from 'next/image';
import React from 'react';

interface RoboYouniMascotProps {
  width?: number;
  height?: number;
  className?: string;
}

const RoboYouniMascot: React.FC<RoboYouniMascotProps> = ({ width = 100, height = 100, className = '' }) => {
  return (
    <Image
      src="/robo-youni.png" // Assuming this is the filename in /public
      alt="RoboYouni Mascot"
      width={width}
      height={height}
      className={className}
      priority // Optional: Prioritize loading if it's above the fold
    />
  );
};

export default RoboYouniMascot;
