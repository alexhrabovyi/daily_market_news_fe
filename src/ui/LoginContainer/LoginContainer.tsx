'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { LoginFormData, LoginFailedResponse, useLoginMutation } from '@/api/api';
import { LogIn } from 'lucide-react';
import SITE_LINKS from '@/utils/SITE_LINKS';
import SideBanner from '@/ui/SideBanner/SideBanner';
import InputBlock from '@/ui/InputBlock/InputBlock';
import Button from '@/ui/Button/Button';
import { emailValidator, passwordValidator } from '@/utils/validators';
import PUBLIC_ASSETS_META from '@/utils/PUBLIC_ASSETS_META';

type LoginFormDataErrors = Record<keyof LoginFormData, string[]>;

export default function LoginContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get('next') || SITE_LINKS.profile;
  // const next = searchParams.get('next') || SITE_LINKS.dashboard;

  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [loginFormDataErrors, setLoginFormDataErrors] = useState<LoginFormDataErrors>({
    email: [],
    password: [],
  });

  const [overallErrors, setOverallErrors] = useState<string[]>([]);

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const validateLoginFormData = useCallback((submittedLoginFormData: LoginFormData) => {
    const newLoginFormDataErrors: LoginFormDataErrors = {
      email: [],
      password: [],
    };

    newLoginFormDataErrors.email = emailValidator(submittedLoginFormData.email);
    newLoginFormDataErrors.password = passwordValidator(submittedLoginFormData.password);

    setLoginFormDataErrors(newLoginFormDataErrors);

    const isValid = Object.values(newLoginFormDataErrors)
      .filter((errs) => errs.length > 0).length === 0;

    return isValid;
  }, []);

  const updateLoginFormData = useCallback((key: keyof LoginFormData, value: string) => {
    setLoginFormData((prev) => ({ ...prev, [key]: value }));

    if (loginFormDataErrors[key].length) {
      setLoginFormDataErrors((prev) => ({ ...prev, [key]: [] }));
    }
  }, [loginFormDataErrors]);

  const emailInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    updateLoginFormData('email', e.target.value);
  }, [updateLoginFormData]);

  const passwordInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    updateLoginFormData('password', e.target.value);
  }, [updateLoginFormData]);

  const formOnSubmit = useCallback(async (submittedLoginFormData: LoginFormData) => {
    if (!validateLoginFormData(submittedLoginFormData)) return;

    setOverallErrors([]);

    try {
      await login(submittedLoginFormData).unwrap();

      router.push(next);
    } catch (err) {
      const e = err as LoginFailedResponse;

      if (e.status === 400) {
        setLoginFormDataErrors(e.data);
      }

      if (e.status === 401) {
        setOverallErrors(['Incorrect email or password']);
      }
    }
  }, [login, next, router, validateLoginFormData]);

  return (
    <div
      className="md:flex min-h-screen"
    >
      <SideBanner>
        <div className="w-full flex flex-col">
          <h1 className="font-inter text-[48px] text-white mb-[24px] leading-[1.2] font-bold">
            All your markets, one clear view
          </h1>
          <p className="font-inter text-[20px] text-white/70">
            Your gateway to every price that moves
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
          <h2 className="font-inter text-black text-[30px] font-bold">
            Log in to your account
          </h2>
          <form
            className="w-full flex flex-col items-stretch gap-[24px]"
            onSubmit={(e) => {
              e.preventDefault();

              formOnSubmit(loginFormData);
            }}
            noValidate
          >
            <InputBlock
              label="Email"
              id="email_input"
              type="email"
              value={loginFormData.email}
              onChange={emailInputOnChange}
              errors={loginFormDataErrors.email}
              required
              name="email"
              placeholder="example@company.com"
            />
            <InputBlock
              label="Password"
              id="password_input"
              type="password"
              value={loginFormData.password}
              onChange={passwordInputOnChange}
              errors={loginFormDataErrors.password}
              required
              name="password"
              placeholder="••••••••"
              className="relative"
            >
              <Link
                href={SITE_LINKS.forgot_password}
                className="absolute top-0 right-0 transition-standart font-inter text-[14px] text-blue-500 hover:underline"
              >
                Forgot your password?
              </Link>
            </InputBlock>
            <Button
              linkMode={false}
              type="submit"
              className="gap-[8px]"
              isDisabled={isLoginLoading}
            >
              {isLoginLoading ? 'Authorization...' : 'Log in'}
              {isLoginLoading ? (
                <Image
                  src={PUBLIC_ASSETS_META.loading_spinner.src}
                  alt={PUBLIC_ASSETS_META.loading_spinner.alt}
                  width={PUBLIC_ASSETS_META.loading_spinner.width}
                  height={PUBLIC_ASSETS_META.loading_spinner.height}
                  className="w-[16px] h-[16px] fill-white"
                />
              ) : (
                <LogIn className="w-[16px] h-[16px]" />
              )}
            </Button>
            <ul
              className="font-inter text-red-500 text-[14px] flex-col items-stretch gap-[8px]"
            >
              {overallErrors.map((error) => (
                <li
                  key={error}
                >
                  {error}
                </li>
              ))}
            </ul>
            <div className="font-inter text-center text-[14px]">
              Don&apos;t have an account?&nbsp;
              <Link
                href={SITE_LINKS.register}
                className="font-medium text-blue-500 hover:underline"
              >
                Register
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
