'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import SideBanner from '@/ui/SideBanner/SideBanner';
import InputBlock from '@/ui/InputBlock/InputBlock';
import { useRequestPasswordResetMutation, RequestPasswordResetFormData, ResetPasswordFailedResponse } from '@/api/api';
import { Mail } from 'lucide-react';
import Button from '@/ui/Button/Button';
import PUBLIC_ASSETS_META from '@/utils/PUBLIC_ASSETS_META';
import SITE_LINKS from '@/utils/SITE_LINKS';
import { emailValidator } from '@/utils/validators';

type RequestPasswordResetFormDataErrors = Record<keyof RequestPasswordResetFormData, string[]>;

export default function ForgotPasswordContainer() {
  const [
    requestPasswordResetFormData,
    setRequestPasswordResetFormData,
  ] = useState<RequestPasswordResetFormData>({
    email: '',
  });

  const [
    requestPasswordResetFormDataErrors,
    setRequestPasswordResetFormDataErrors,
  ] = useState<RequestPasswordResetFormDataErrors>({
    email: [],
  });

  const [countDown, setCountDown] = useState(60);

  useEffect(() => {
    const countdownFinish = Number(JSON.parse(localStorage.getItem('request_password_reset_finish') || '0'));

    if (countdownFinish) {
      const secDiff = Math.floor((Date.now() - countdownFinish) / 1000);

      if (secDiff >= 0) {
        setCountDown(0);
      } else {
        setCountDown(Math.abs(secDiff));
      }
    } else {
      setCountDown(0);
    }
  }, []);

  useEffect(() => {
    if (countDown === 0) return;

    const timerId = setTimeout(() => {
      setCountDown((prevCountDown) => prevCountDown - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [countDown]);

  const [requestPasswordReset, { isLoading, isSuccess }] = useRequestPasswordResetMutation();

  const validateRequestPasswordResetFormData = useCallback(
    (submittedRequestPasswordResetFormData: RequestPasswordResetFormData) => {
      const newRequestPasswordResetFormDataErrors: RequestPasswordResetFormDataErrors = {
        email: [],
      };

      newRequestPasswordResetFormDataErrors
        .email = emailValidator(submittedRequestPasswordResetFormData.email);

      setRequestPasswordResetFormDataErrors(newRequestPasswordResetFormDataErrors);

      const isValid = Object.values(newRequestPasswordResetFormDataErrors)
        .filter((errs) => errs.length > 0).length === 0;

      return isValid;
    },
    [],
  );

  const updateRequestPasswordResetFormData = useCallback(
    (key: keyof RequestPasswordResetFormData, value: string) => {
      setRequestPasswordResetFormData((prev) => ({ ...prev, [key]: value }));

      if (requestPasswordResetFormDataErrors[key].length) {
        setRequestPasswordResetFormDataErrors((prev) => ({ ...prev, [key]: [] }));
      }
    },
    [requestPasswordResetFormDataErrors],
  );

  const emailInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    updateRequestPasswordResetFormData('email', e.target.value);
  }, [updateRequestPasswordResetFormData]);

  const formOnSubmit = useCallback(
    async (submittedRequestPasswordResetFormData: RequestPasswordResetFormData) => {
      if (
        !validateRequestPasswordResetFormData(submittedRequestPasswordResetFormData)
        || isLoading
      ) return;

      let newCountDown: number | null = null;

      try {
        const resp = await requestPasswordReset(submittedRequestPasswordResetFormData).unwrap();

        newCountDown = resp.retry_after;
      } catch (err) {
        const e = err as ResetPasswordFailedResponse;

        if (e.status === 400) {
          setRequestPasswordResetFormDataErrors(e.data);
        } else if (e.status === 429) {
          newCountDown = e.data.retry_after;
        }
      } finally {
        if (newCountDown !== null) {
          setCountDown(newCountDown);
          localStorage.setItem('request_password_reset_finish', JSON.stringify(Date.now() + newCountDown * 1000));
        }
      }
    },
    [isLoading, requestPasswordReset, validateRequestPasswordResetFormData],
  );

  return (
    <div
      className="md:flex min-h-screen"
    >
      <SideBanner>
        <div className="w-full flex flex-col">
          <h1 className="font-inter text-[48px] text-white mb-[24px] leading-[1.2] font-bold">
            Restoring access
          </h1>
          <p className="font-inter text-[20px] text-white/70">
            We&apos;ll help you recover your password and get back to work.
          </p>
        </div>
      </SideBanner>
      <main
        className="w-full standart-padding pt-[64px] pb-[64px] xl:pt-[100px] xl:pb-[100px] bg-white
          flex justify-center"
      >
        <div
          className="w-full max-w-[460px] flex flex-col items-stretch gap-[32px]"
        >
          {isSuccess ? (
            <div
              className="flex flex-col items-center gap-[16px]"
            >
              <span
                className="mb-[24px] w-[96px] h-[96px] rounded-full bg-blue-100 flex items-center justify-center"
              >
                <Mail className="h-[48px] w-[48px] text-blue-500" />
              </span>
              <h2 className="font-inter text-black text-[30px] font-bold">
                Email sent
              </h2>
              <p
                className="font-inter text-[16px] text-gray-600"
              >
                Check your email
              </p>
            </div>
          ) : (
            <div
              className="flex flex-col items-stretch gap-[16px]"
            >
              <h2 className="font-inter text-black text-[30px] font-bold">
                Password recovery
              </h2>
              <p
                className="font-inter text-[16px] text-gray-600"
              >
                Enter the email you used to register and we will send you a password reset email.
              </p>
            </div>
          )}
          <form
            className="w-full flex flex-col items-stretch gap-[24px]"
            onSubmit={(e) => {
              e.preventDefault();

              formOnSubmit(requestPasswordResetFormData);
            }}
            noValidate
          >
            <InputBlock
              label="Email"
              id="email_input"
              type="email"
              value={requestPasswordResetFormData.email}
              onChange={emailInputOnChange}
              errors={requestPasswordResetFormDataErrors.email}
              required
              name="email"
              placeholder="your.email@example.com"
            />
            <Button
              linkMode={false}
              type="submit"
              className="gap-[16px]"
              isDisabled={isLoading || !!countDown}
            >
              {isLoading ? (
                <>
                  Sending email...
                  <Image
                    src={PUBLIC_ASSETS_META.loading_spinner.src}
                    alt={PUBLIC_ASSETS_META.loading_spinner.alt}
                    width={PUBLIC_ASSETS_META.loading_spinner.width}
                    height={PUBLIC_ASSETS_META.loading_spinner.height}
                    className="w-[16px] h-[16px] fill-white"
                  />
                </>
              ) : countDown > 0 ? `Reset password (${countDown}s)` : 'Reset password'}
            </Button>
            <Link
              href={SITE_LINKS.login}
              className="font-inter text-center text-[14px] font-medium text-blue-500 hover:underline"
            >
              Return to login
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}
