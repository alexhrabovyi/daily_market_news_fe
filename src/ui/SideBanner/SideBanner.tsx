import Image from 'next/image';
import Link from 'next/link';

import SITE_LINKS from '@/utils/SITE_LINKS';
import PUBLIC_ASSETS_META from '@/utils/PUBLIC_ASSETS_META';

import DottedPlanetSVG from './imgs/dotted_planet.svg';

interface SideBannerProps {
  readonly children: React.ReactNode
}

export default function SideBanner({ children }: SideBannerProps) {
  return (
    <aside className="relative standart-padding xl:pt-[100px] bg-dark-blue
      flex items-stretch w-full md:max-w-[416px] lg:max-w-[450px] 1100:max-w-[45%]
      xl:max-w-[50%] min-h-[450px] overflow-hidden"
    >
      <div className="relative z-[1] self-stretch flex flex-col gap-[60px]">
        <Link href={SITE_LINKS.index}>
          <Image
            className="w-[120px] sm:w-[140px] xl:w-[160px] h-auto"
            src={PUBLIC_ASSETS_META.logo.src}
            alt={PUBLIC_ASSETS_META.logo.alt}
            width={PUBLIC_ASSETS_META.logo.width}
            height={PUBLIC_ASSETS_META.logo.height}
          />
        </Link>
        <div
          className="h-full"
        >
          {children}
        </div>
      </div>
      <DottedPlanetSVG
        className="absolute w-[90%] sm:w-[80%] md:w-[90%] h-auto top-[50%] md:top-[40%]
          915:top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] z-0"
      />
    </aside>
  );
}
