import React from 'react';
import { useScreenSize } from "@/components/hooks/use-screen-size"
import { PixelTrail } from "@/components/ui/pixel-trail"

const PixelTrailDemo: React.FC = () => {
  const screenSize = useScreenSize()

  return (
    <div className="relative w-full h-full bg-[#dcddd7] flex flex-col font-calendas">
      <div className="absolute inset-0 z-0">
        <PixelTrail
          pixelSize={screenSize.lessThan(`md`) ? 48 : 80}
          fadeDuration={0}
          delay={1200}
          pixelClassName="rounded-full bg-[#ffa04f]"
        />
      </div>
    </div>
  )
}

export { PixelTrailDemo }
