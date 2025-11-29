'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import useHideScrollbarOnOpen from '@/hooks/useHideScrollbarOnOpen';
import SITE_LINKS from '@/utils/SITE_LINKS';
import PUBLIC_ASSETS_META from '@/utils/PUBLIC_ASSETS_META';
import Nav from '@/ui/Nav/Nav';
import BurgerButton from '@/ui/BurgerButton/BurgerButton';
import Backdrop from '@/ui/Backdrop/Backdrop';

interface NavLayoutProps {
  children?: React.ReactNode
}

export default function NavLayout({ children }: NavLayoutProps) {
  const NAV_ID = 'navMenu';
  const NAV_OPEN_BTN_ID = 'navMenuOpenButton';

  const [isNavOpen, setIsNavOpen] = useState(false);

  useHideScrollbarOnOpen(isNavOpen);

  const BurgerBtnOnClickHandler = useCallback(() => {
    setIsNavOpen((isOpen) => !isOpen);
  }, []);

  const closeNav = useCallback(() => setIsNavOpen(false), []);

  return (
    <>
      <div
        className="915:hidden sticky top-[0] left-[0] z-[10] w-full bg-white shadow-sm p-[16px] flex items-center"
      >
        <div
          className="flex items-center gap-[16px]"
        >
          <BurgerButton
            isOpen={isNavOpen}
            onClickHandler={BurgerBtnOnClickHandler}
            btnId={NAV_OPEN_BTN_ID}
            controlsId={NAV_ID}
          />
          <Link href={SITE_LINKS.dashboard}>
            <Image
              src={PUBLIC_ASSETS_META.logo_black.src}
              alt={PUBLIC_ASSETS_META.logo_black.alt}
              width={PUBLIC_ASSETS_META.logo_black.width}
              height={PUBLIC_ASSETS_META.logo_black.height}
            />
          </Link>
        </div>
      </div>
      <div
        className="915:grid 915:grid-cols-[256px_1fr] min-h-screen bg-gray-50"
      >
        <Nav
          navId={NAV_ID}
          btnId={NAV_OPEN_BTN_ID}
          isOpen={isNavOpen}
          closeNav={closeNav}
        />
        <Backdrop
          isActive={isNavOpen}
          onClick={closeNav}
          className="915:hidden"
        />
        <div className="col-[2/3]  min-w-0">
          {children}
        </div>
      </div>
    </>
  );
}
