/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import {
  ConfirmPasswordResetFormData,
  useConfirmPasswordResetMutation,
  ConfirmPasswordResetFailedResponse,
} from '@/api/api';
import SideBanner from '@/ui/SideBanner/SideBanner';
import InputBlock from '@/ui/InputBlock/InputBlock';
import PasswordStrength from '@/ui/PasswordStrength/PasswordStrength';
import Button from '@/ui/Button/Button';
import PUBLIC_ASSETS_META from '@/utils/PUBLIC_ASSETS_META';
import SITE_LINKS from '@/utils/SITE_LINKS';
import { confirmPasswordValidator, passwordValidator } from '@/utils/validators';
import { Key, Check } from 'lucide-react';

interface PasswordData {
  new_password: string,
  new_confirm_password: string
}

type PasswordDataErrors = Record<keyof PasswordData, string[]>;

export default function ConfirmPasswordResetContainer() {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    new_password: '',
    new_confirm_password: '',
  });

  const [passwordDataErrors, setPasswordDataErrors] = useState<PasswordDataErrors>({
    new_password: [],
    new_confirm_password: [],
  });

  const [overallErrors, setOverallErrors] = useState<string[]>([]);

  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const [confirmPasswordReset, { isLoading, isSuccess }] = useConfirmPasswordResetMutation();

  const validatePasswordData = () => {
    const newPasswordDataErrors: PasswordDataErrors = {
      new_password: [],
      new_confirm_password: [],
    };

    newPasswordDataErrors.new_password = passwordValidator(passwordData.new_password);
    newPasswordDataErrors.new_confirm_password = confirmPasswordValidator(
      passwordData.new_password,
      passwordData.new_confirm_password,
    );

    setPasswordDataErrors(newPasswordDataErrors);

    return Object.values(newPasswordDataErrors)
      .filter((errs) => errs.length > 0).length === 0;
  };

  const updatePasswordData = useCallback((key: keyof PasswordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [key]: value }));
    setOverallErrors([]);

    if (passwordDataErrors[key].length) {
      setPasswordDataErrors((prev) => ({ ...prev, [key]: [] }));
    }
  }, [passwordDataErrors]);

  const newPasswordInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    updatePasswordData('new_password', e.target.value);
  }, [updatePasswordData]);

  const newConfirmPasswordInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    updatePasswordData('new_confirm_password', e.target.value);
  }, [updatePasswordData]);

  const formOnSubmit = async () => {
    if (
      !validatePasswordData()
      || !token
      || isLoading
    ) return;

    const passwordResetConfirmFormData: ConfirmPasswordResetFormData = {
      token,
      new_password: passwordData.new_password,
    };

    try {
      await confirmPasswordReset(passwordResetConfirmFormData).unwrap();
    } catch (err) {
      const e = err as ConfirmPasswordResetFailedResponse;

      if (e.status === 400) {
        if ('detail' in e.data) {
          setOverallErrors((prev) => ([
            ...prev,
            (e.data as any).detail,
          ]));
        }

        if ('token' in e.data) {
          setOverallErrors((prev) => ([
            ...prev,
            'Invalid or expired token',
          ]));
        }

        if ('new_password' in e.data) {
          setPasswordDataErrors((prev) => ({
            ...prev,
            ...(e.data as any),
          }));
        }
      }
    }
  };

  return (
    <div
      className="md:flex min-h-screen"
    >
      <SideBanner>
        <div className="w-full flex flex-col">
          <h1 className="font-inter text-[48px] text-white mb-[24px] leading-[1.2] font-bold">
            {isSuccess ? 'Done!' : 'Restoring access'}
          </h1>
          <p className="font-inter text-[20px] text-white/70">
            {isSuccess
              ? 'You have successfully changed your password. You can now log in'
              : 'Create a new strong password for your account'}
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
              className="flex flex-col items-center gap-[24px] text-center"
            >
              <div className="w-[96px] h-[96px] bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-[48px] h-[48px] text-green-500" />
              </div>
              <h2 className="font-inter text-black text-[30px] font-bold">
                Password changed
                <br />
                successfully!
              </h2>
              <p className="font-inter text-[16px] text-gray-600">
                You can use your new password to log in
              </p>
              <Button
                linkMode
                href={SITE_LINKS.login}
                className="w-full"
              >
                Go to login
              </Button>
            </div>
          ) : (
            <>
              <div
                className="flex flex-col items-stretch gap-[16px]"
              >
                <h2 className="font-inter text-black text-[30px] font-bold">
                  Create a new password
                </h2>
                <p className="font-inter text-[16px] text-gray-600">
                  Your password must contain at least 8 characters.
                </p>
              </div>
              <form
                className="w-full flex flex-col items-stretch gap-[24px]"
                onSubmit={(e) => {
                  e.preventDefault();

                  formOnSubmit();
                }}
                noValidate
              >
                <div
                  className="flex flex-col items-stretch gap-[8px] col-[1/3]"
                >
                  <InputBlock
                    label="New password"
                    id="new_password_input"
                    type="password"
                    value={passwordData.new_password}
                    onChange={newPasswordInputOnChange}
                    errors={passwordDataErrors.new_password}
                    required
                    name="new_password"
                  />
                  {passwordData.new_password && (
                    <PasswordStrength password={passwordData.new_password} />
                  )}
                </div>
                <InputBlock
                  label="Confirm password"
                  id="new_confirm_password_input"
                  type="password"
                  value={passwordData.new_confirm_password}
                  onChange={newConfirmPasswordInputOnChange}
                  errors={passwordDataErrors.new_confirm_password}
                  required
                  name="new_confirm_password"
                />
                <Button
                  linkMode={false}
                  type="submit"
                  className="gap-[8px]"
                  isDisabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      Saving...
                      <Image
                        src={PUBLIC_ASSETS_META.loading_spinner.src}
                        alt={PUBLIC_ASSETS_META.loading_spinner.alt}
                        width={PUBLIC_ASSETS_META.loading_spinner.width}
                        height={PUBLIC_ASSETS_META.loading_spinner.height}
                        className="w-[16px] h-[16px] fill-white"
                      />
                    </>
                  ) : (
                    <>
                      <Key className="w-[16px] h-[16px]" />
                      Save new password
                    </>
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
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
