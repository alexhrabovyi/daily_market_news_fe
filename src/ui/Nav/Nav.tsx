/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCallback, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import clsx from 'clsx';
import SITE_LINKS, { LinkName } from '@/utils/SITE_LINKS';
import PUBLIC_ASSETS_META from '@/utils/PUBLIC_ASSETS_META';
import NavLink from '@/ui/NavLink/NavLink';
import useOnResize from '@/hooks/useOnResize';
import { useLogoutMutation } from '@/api/api';
import Logout from './imgs/logout.svg';

interface WindowMetrics {
  width: number,
  height: number,
}

type NavLinkName = Exclude<LinkName, 'index' | 'register' | 'login' | 'confirm_email' | 'forgot_password'>

const MAIN_LINK_NAMES: NavLinkName[] = ['dashboard'];
const MARKET_LINK_NAMES: NavLinkName[] = ['crypto_dashboard', 'stock_dashboard', 'currency_dashboard'];
const SETTINGS_LINK_NAMES: NavLinkName[] = ['email_digest', 'profile'];

interface NavProps {
  isOpen: boolean,
  navId: string,
  btnId: string,
  closeNav: () => void,
}

export default function Nav({
  isOpen, navId, btnId, closeNav,
}: NavProps) {
  const router = useRouter();

  const logoBlockRef = useRef<HTMLDivElement | null>(null);
  const linksBlockRef = useRef<HTMLDivElement | null>(null);
  const logoutBlockRef = useRef<HTMLDivElement | null>(null);

  const [windowMetrics, setWindowMetrics] = useState<WindowMetrics>({
    width: 0,
    height: 0,
  });

  const [logoBlockHeight, setLogoBlockHeight] = useState(0);
  const [linksBlockHeight, setLinksBlockHeight] = useState(0);
  const [logoutBlockHeight, setLogoutBlockHeight] = useState(0);

  const [logout] = useLogoutMutation();

  const inferWindowMetrics = useCallback(() => {
    setWindowMetrics({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useLayoutEffect(inferWindowMetrics, [inferWindowMetrics]);
  useOnResize(inferWindowMetrics);

  const inferElementsMetrics = useCallback(() => {
    const logoBlock = logoBlockRef.current;
    const linksBlock = linksBlockRef.current;
    const logoutBlock = logoutBlockRef.current;

    if (!logoBlock || !linksBlock || !logoutBlock) return;

    setLogoBlockHeight(logoBlock.scrollHeight);
    setLinksBlockHeight(linksBlock.scrollHeight);
    setLogoutBlockHeight(logoutBlock.scrollHeight);
  }, []);

  useLayoutEffect(inferElementsMetrics, [inferElementsMetrics]);
  useOnResize(inferElementsMetrics);

  const mainLinks = useMemo(() => (
    MAIN_LINK_NAMES.map((n) => <NavLink key={n} linkName={n} />)
  ), []);

  const marketLinks = useMemo(() => (
    MARKET_LINK_NAMES.map((n) => <NavLink key={n} linkName={n} />)
  ), []);

  const settingsLinks = useMemo(() => (
    SETTINGS_LINK_NAMES.map((n) => <NavLink key={n} linkName={n} />)
  ), []);

  const linksBlockStyleHeight = windowMetrics.height - logoBlockHeight - logoutBlockHeight;
  const isLinkBlockOverflowY = linksBlockHeight > linksBlockStyleHeight;

  async function logoutBtnOnClick() {
    router.push(SITE_LINKS.login);
    await logout(null).unwrap();
  }

  const navMenuOrPanelOnClick = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a')) closeNav();
  };

  return (
    <nav
      id={navId}
      className={clsx(
        `fixed z-[1000] 915:z-[1] top-[0] w-full max-w-[256px] bg-dark-blue 
        transition-[translate,_opacity] duration-500 ease-in-out 915:transition-none`,
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[-100%] 915:translate-x-[0%] opacity-0 915:opacity-100',
      )}
      style={{
        height: `${windowMetrics.height}px`,
      }}
      aria-labelledby={btnId}
      onClick={navMenuOrPanelOnClick}
    >
      <div
        ref={logoBlockRef}
        className="w-full p-[24px]"
      >
        <Link href={SITE_LINKS.dashboard}>
          <Image
            src={PUBLIC_ASSETS_META.logo.src}
            alt={PUBLIC_ASSETS_META.logo.alt}
            width={PUBLIC_ASSETS_META.logo.width}
            height={PUBLIC_ASSETS_META.logo.height}
          />
        </Link>
      </div>
      <div
        ref={linksBlockRef}
        className={clsx(
          'flex flex-col gap-[4px] items-stretch px-[8px] scroll-content',
          isLinkBlockOverflowY && 'overflow-y-scroll',
        )}
        style={{
          height: linksBlockStyleHeight ? `${linksBlockStyleHeight}px` : 'auto',
        }}
      >
        {mainLinks}
        <span
          className="h-[1px] ml-[12px] mr-[12px] bg-white/10"
        />
        {marketLinks?.length && (
          <>
            <div className="px-[16px] py-[8px] font-inter text-[12px] text-white/70">
              Markets
            </div>
            {marketLinks}
          </>
        )}
        <span
          className="h-[1px] ml-[12px] mr-[12px] bg-white/10"
        />
        {settingsLinks?.length && (
          <>
            <div className="px-[16px] py-[8px] font-inter text-[12px] text-white/70">
              Management
            </div>
            {settingsLinks}
          </>
        )}
      </div>
      <div
        ref={logoutBlockRef}
        className="w-full fixed bottom-[0] left-[0] p-[16px] border-solid border-t-[1px] border-white/10 bg-dark-blue"
      >
        <button
          type="button"
          className="w-full px-[16px] py-[8px] flex justify-center items-center gap-[8px]
            bg-shipit-red hover:bg-red-600 text-white rounded-[6px] transition-standart cursor-pointer"
          onClick={logoutBtnOnClick}
        >
          <Logout
            className="h-[20px] w-[20px]"
          />
          Logout
        </button>
      </div>
    </nav>
  );
}
