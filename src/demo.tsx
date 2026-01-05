import React from 'react';
import HeroBG from './components/ui/HeroBG';

const PixelTrailDemo: React.FC = () => {

  return (
    <div className="relative w-full h-full bg-[#dcddd7] flex flex-col font-calendas">
      <HeroBG />
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
         <h1 className="text-white text-4xl mix-blend-difference">Taurus Glyph</h1>
      </div>
    </div>
  )
}

export { PixelTrailDemo }
