'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ForwardRefExoticComponent, memo, RefAttributes } from 'react';
import clsx from 'clsx';
import SITE_LINKS, { LinkName } from '@/utils/SITE_LINKS';
import {
  Home,
  User,
  LucideProps,
  Bitcoin,
  ChartCandlestick,
  CircleDollarSign,
  Mail,
} from 'lucide-react';

const ICONS_MAP: Record<
  Exclude<LinkName, 'index' | 'register' | 'login' | 'confirm_email' | 'forgot_password'>,
  ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
> = {
  dashboard: Home,
  crypto_dashboard: Bitcoin,
  stock_dashboard: ChartCandlestick,
  currency_dashboard: CircleDollarSign,
  email_digest: Mail,
  profile: User,
};

const NAME_MAP: Record<
  Exclude<LinkName, 'index' | 'register' | 'login' | 'confirm_email' | 'forgot_password'>, string
> = {
  dashboard: 'Dashboard',
  crypto_dashboard: 'Crypto',
  stock_dashboard: 'Stocks',
  currency_dashboard: 'Currencies',
  email_digest: 'Email digest',
  profile: 'Profile',
};

interface NavLink {
  linkName: Exclude<LinkName, 'index' | 'register' | 'login' | 'confirm_email' | 'forgot_password'>
}

const NavLink = memo<NavLink>(({ linkName }) => {
  const pathname = usePathname();

  const CurrentIcon = ICONS_MAP[linkName];
  const CurrentLinkPath = SITE_LINKS[linkName];

  const isActive = pathname === CurrentLinkPath;

  return (
    <Link
      href={CurrentLinkPath}
      className={clsx(
        `flex items-center gap-[12px] px-[16px] py-[12px] text-[14px] text-white 
        font-inter transition-standart rounded-[8px]`,
        isActive ? 'bg-white/20 font-medium' : 'hover:bg-white/10',
      )}
    >
      <CurrentIcon
        className="opacity-80 h-[20px] "
      />
      {NAME_MAP[linkName]}
    </Link>
  );
});

NavLink.displayName = 'NavLink';

export default NavLink;
