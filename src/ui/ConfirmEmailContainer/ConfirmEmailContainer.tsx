'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import SideBanner from '@/ui//SideBanner/SideBanner';
import Button from '@/ui/Button/Button';
import SITE_LINKS from '@/utils/SITE_LINKS';
import { useConfirmEmailMutation } from '@/api/api';
import { Mail } from 'lucide-react';

export default function ConfirmEmailContainer() {
  const searchParams = useSearchParams();

  const fixedSearchParams = new URLSearchParams(searchParams.toString());
  const token = fixedSearchParams.get('token');

  const [
    confirmEmail,
    {
      isLoading: isConfirmEmailLoading,
      isSuccess: isConfirmEmailSuccess,
      isError: isConfirmEmailError,
    },
  ] = useConfirmEmailMutation();

  useEffect(() => {
    async function fetchData() {
      if (
        isConfirmEmailLoading
        || isConfirmEmailSuccess
        || isConfirmEmailError
        || !token
      ) return;

      try {
        await confirmEmail({ token }).unwrap();
      } catch {
        // do something with error
      }
    }

    fetchData();
  }, [confirmEmail, isConfirmEmailLoading, isConfirmEmailSuccess, isConfirmEmailError, token]);

  return (
    <main
      className="md:flex min-h-screen"
    >
      <SideBanner>
        <div className="w-full h-full flex flex-col justify-between md:justify-start pt-[40px] pb-[40px]">
          <h1 className="font-inter text-[48px] text-white mb-[24px] leading-[1.2] font-bold">
            {isConfirmEmailLoading ? 'Confirmation...' : 'Done!'}
          </h1>
          <p className="font-inter text-[20px] text-white/70">
            {isConfirmEmailSuccess && 'You have successfully confirmed your email.'}
          </p>
        </div>
      </SideBanner>
      <div
        className="w-full flex justify-center"
      >
        <div
          className="standart-padding w-full max-w-[460px] pt-[64px] pb-[64px]  xl:pt-[100px] xl:pb-[100px] bg-white flex flex-col items-center"
        >
          <span
            className="mb-[16px] w-[96px] h-[96px] rounded-full bg-blue-100 flex items-center justify-center"
          >
            <Mail className="h-[48px] w-[48px] text-blue-500" />
          </span>
          <h2
            className="font-inter text-black text-[30px] font-bold text-center leading-[36px] mb-[36px]"
          >
            {isConfirmEmailSuccess && 'Confirmed'}
          </h2>
          <Button
            linkMode
            href={SITE_LINKS.login}
            className="w-full"
            isDisabled={isConfirmEmailLoading}
          >
            Go to login
          </Button>
        </div>
      </div>
    </main>
  );
}
