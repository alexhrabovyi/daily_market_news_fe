'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/api/hooks';
import { api } from '@/api/api';
import { setUser } from '@/api/authSlice';
import SITE_LINKS from '@/utils/SITE_LINKS';
import PUBLIC_ASSETS_META from '@/utils/PUBLIC_ASSETS_META';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const path = usePathname();

  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) {
      const accessToken = localStorage.getItem('accessToken');
      const userFromLocalStorage = JSON.parse(localStorage.getItem('user') as string);

      if (userFromLocalStorage && accessToken) {
        dispatch(setUser(userFromLocalStorage));
      } else if (!userFromLocalStorage && accessToken) {
        dispatch(api.endpoints.getUserProfile.initiate(null));
      } else {
        const loginUrl = new URL(SITE_LINKS.login, window.location.origin);
        loginUrl.searchParams.set('next', path);
        router.replace(loginUrl.toString());
      }
    } else {
      setIsLoading(false);
    }
  }, [path, router, user, dispatch]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Image
          src={PUBLIC_ASSETS_META.logo_black.src}
          alt={PUBLIC_ASSETS_META.logo_black.alt}
          width={PUBLIC_ASSETS_META.logo_black.width}
          height={PUBLIC_ASSETS_META.logo_black.height}
        />
      </div>
    );
  }

  return children;
}
