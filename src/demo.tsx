import React from 'react';

const PixelTrailDemo: React.FC = () => {

  return (
      <div className="relative w-full h-full bg-[#dcddd7] flex flex-col font-calendas">
          <div id="threejs-bg" className="absolute inset-0 z-0">
            
          </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
         <h1 className="text-white text-4xl mix-blend-difference">Taurus Glyph</h1>
      </div>
    </div>
  )
}

export { PixelTrailDemo }
