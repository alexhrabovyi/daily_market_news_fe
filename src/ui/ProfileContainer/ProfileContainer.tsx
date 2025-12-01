/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  ResendEmailConfirmationFailedResponse,
  UpdateUserProfileFailedResponse,
  useGetUserProfileQuery,
  useResendEmailConfirmationMutation,
  useUpdateUserProfileMutation,
} from '@/api/api';
import InputBlock from '@/ui/InputBlock/InputBlock';
import Button from '@/ui/Button/Button';
import Dialog from '@/ui/Dialog/Dialog';
import SkeletonFigure from '@/ui/SkeletonFigure/SkeletonFigure';
import {
  Save, User, Mail,
} from 'lucide-react';
import PUBLIC_ASSETS_META from '@/utils/PUBLIC_ASSETS_META';
import { fistNameLastNameValidator, emailValidator } from '@/utils/validators';

export interface ProfileInfoFormData {
  first_name: string,
  last_name: string,
}

export type ProfileInfoFormDataErrors = Record<keyof ProfileInfoFormData, string[]>;

const CHANGE_EMAIL_DIALOG_ID = 'change_email_dialog';

export default function ProfileContainer() {
  const [isServerDataLoaded, setIsServerDataLoaded] = useState(false);

  const [profileInfoFormData, setProfileInfoFormData] = useState<ProfileInfoFormData>({
    first_name: '',
    last_name: '',
  });
  const [
    profileInfoFormDataErrors, setProfileInfoFormDataErrors,
  ] = useState<ProfileInfoFormDataErrors>({
    first_name: [],
    last_name: [],
  });

  const [isEmailConfirmed, setIsEmailConfirmed] = useState(true);

  const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = useState(false);
  const [newEmailInputValue, setNewEmailInputValue] = useState('');
  const [newEmailInputErrors, setNewEmailInputErrors] = useState<string[]>([]);

  const [confirmationEmailErrors, setConfirmationEmailErrors] = useState<string[]>([]);

  const [emailConfirmationCountDown, setEmailConfirmationCountDown] = useState(0);

  const {
    data,
    isLoading: isUserProfileDataLoading,
    isFetching: isUserProfileFetching,
  } = useGetUserProfileQuery(null);

  if (data !== undefined && isUserProfileFetching === false && isServerDataLoaded === false) {
    setIsServerDataLoaded(true);

    setProfileInfoFormData({
      first_name: data.first_name || '',
      last_name: data.last_name || '',
    });

    setIsEmailConfirmed(data.is_email_confirmed);
  }

  const [
    updateUserProfile,
    { isLoading: isUpdateUserProfileLoading },
  ] = useUpdateUserProfileMutation();

  const [
    sendEmailConfirmation,
    {
      isLoading: isSendEmailConfirmationLoading,
      isSuccess: isSendEmailConfirmationSuccess,
      isError: isSendEmailConfirmationError,
    },
  ] = useResendEmailConfirmationMutation();

  const updateProfileInfoFormData = useCallback((key: keyof ProfileInfoFormData, value: string) => {
    setProfileInfoFormData((prev) => ({ ...prev, [key]: value }));

    if (profileInfoFormDataErrors[key].length) {
      setProfileInfoFormDataErrors((prev) => ({ ...prev, [key]: [] }));
    }
  }, [profileInfoFormDataErrors]);

  useEffect(() => {
    const countdownFinish = Number(JSON.parse(localStorage.getItem('resend_email_countdown_finish') || '0'));

    if (countdownFinish) {
      const secDiff = Math.floor((Date.now() - countdownFinish) / 1000);

      if (secDiff < 0) setEmailConfirmationCountDown(Math.abs(secDiff));
    }
  }, []);

  useEffect(() => {
    if (emailConfirmationCountDown === 0) return;

    const timerId = setTimeout(() => {
      setEmailConfirmationCountDown((prevCountDown) => prevCountDown - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [emailConfirmationCountDown]);

  const validateAndTrimProfileInfo = useCallback(() => {
    const newProfileInfoErrors: ProfileInfoFormDataErrors = {
      first_name: [],
      last_name: [],
    };

    const firstNameTrimmed = profileInfoFormData.first_name.trim();
    const lastNameTrimmed = profileInfoFormData.last_name.trim();

    newProfileInfoErrors.first_name = fistNameLastNameValidator(firstNameTrimmed);
    newProfileInfoErrors.last_name = fistNameLastNameValidator(lastNameTrimmed, false);

    setProfileInfoFormData((prevPI) => ({
      ...prevPI,
      first_name: firstNameTrimmed,
      last_name: lastNameTrimmed,
    }));
    setProfileInfoFormDataErrors(newProfileInfoErrors);

    const isValid = Object.values(newProfileInfoErrors)
      .filter((errs) => errs.length > 0).length === 0;

    return {
      firstNameTrimmed,
      lastNameTrimmed,
      isValid,
    };
  }, [profileInfoFormData]);

  const firstNameInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateProfileInfoFormData('first_name', e.target.value);
  }, [updateProfileInfoFormData]);

  const lastNameInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateProfileInfoFormData('last_name', e.target.value);
  }, [updateProfileInfoFormData]);

  const profileFormOnSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isUserProfileFetching || isUpdateUserProfileLoading || !data) return;

    // prevent sending request if no changes were made
    if (profileInfoFormData.first_name === data.first_name
      && profileInfoFormData.last_name === data.last_name) return;

    const {
      isValid, firstNameTrimmed, lastNameTrimmed,
    } = validateAndTrimProfileInfo();

    if (!isValid) return;

    const requestBody = {
      first_name: firstNameTrimmed,
      last_name: lastNameTrimmed,

    };

    try {
      await updateUserProfile(requestBody).unwrap();

      setIsServerDataLoaded(false);
    } catch (err) {
      const e = err as UpdateUserProfileFailedResponse;

      if (e.data) {
        setProfileInfoFormDataErrors((prev) => ({
          ...prev,
          ...e.data,
        }));
      }
    }
  }, [
    data,
    isUpdateUserProfileLoading,
    isUserProfileFetching,
    profileInfoFormData,
    validateAndTrimProfileInfo,
    updateUserProfile,
  ]);

  const newEmailInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmailInputValue(e.target.value.trim());
  }, []);

  const sendEmailConfirmationBtnOnClick = useCallback(async () => {
    if (isSendEmailConfirmationLoading || !data) return;

    let newCountDown: number | null = null;

    try {
      const resendEmailResp = await sendEmailConfirmation({ user_id: data.id }).unwrap();

      newCountDown = resendEmailResp.retry_after;
    } catch (err) {
      const e = err as ResendEmailConfirmationFailedResponse;

      if (e.status === 404) {
        setConfirmationEmailErrors(['An unknown error occurred. Please try again later.']);
        newCountDown = 60;
      } else if (e.status === 429) {
        newCountDown = e.data.retry_after;
      }
    } finally {
      if (newCountDown !== null) {
        setEmailConfirmationCountDown(newCountDown);
        localStorage.setItem('resend_email_countdown_finish', JSON.stringify(Date.now() + newCountDown * 1000));
      }
    }
  }, [data, isSendEmailConfirmationLoading, sendEmailConfirmation]);

  const changeEmailFormOnSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // prevent sending request if no changes were made or request is loading
    if (isUpdateUserProfileLoading || !data || newEmailInputValue === data?.email) return;

    const emailErrors = emailValidator(newEmailInputValue);

    if (emailErrors.length) {
      setNewEmailInputErrors(emailErrors);
      return;
    }

    try {
      await updateUserProfile({ email: newEmailInputValue }).unwrap();

      setIsServerDataLoaded(false);

      let newCountDown: number | null = null;

      try {
        const resendEmailResp = await sendEmailConfirmation({ user_id: data.id }).unwrap();

        newCountDown = resendEmailResp.retry_after;
      } catch (err) {
        const e = err as ResendEmailConfirmationFailedResponse;

        if (e.status === 404) {
          setConfirmationEmailErrors(['An unknown error occurred. Please try again later.']);
          setNewEmailInputErrors(['An unknown error occurred. Please try again later.']);
          newCountDown = 60;
        } else if (e.status === 429) {
          newCountDown = e.data.retry_after;
        }
      } finally {
        if (newCountDown !== null) {
          setEmailConfirmationCountDown(newCountDown);
          localStorage.setItem('resend_email_countdown_finish', JSON.stringify(Date.now() + newCountDown * 1000));
        }
      }
    } catch (err) {
      const e = err as UpdateUserProfileFailedResponse;

      if (e.data.email) {
        setNewEmailInputErrors((prev) => ([
          ...e.data.email,
        ]));
      }
    }
  }, [
    data, isUpdateUserProfileLoading, newEmailInputValue, sendEmailConfirmation, updateUserProfile,
  ]);

  const closeEmailDialog = useCallback(() => setIsChangeEmailDialogOpen(false), []);

  return (
    <>
      <main
        className="md:max-w-[720px] md:ml-auto md:mr-auto page-content-padding 915:p-[50px_16px_70px_16px]
          flex flex-col items-stretch gap-[24px] font-inter"
      >
        <h1 className="text-[20px] sm:text-[24px] font-semibold">
          User profile
        </h1>
        <form
          className="w-full bg-white rounded-lg shadow-sm p-[16px] sm:p-[24px] flex flex-col items-strech gap-[24px]"
          onSubmit={profileFormOnSubmit}
          noValidate
        >
          <div
            className="flex items-center gap-[16px]"
          >
            <span className="w-[64px] h-[64px] rounded-full bg-blue-100 flex items-center justify-center">
              <User
                className="text-blue-500 w-[32px] h-[32px]"
              />
            </span>
            <div>
              {data ? (
                <h2 className="font-semibold text-[20px]">
                  {`${data.first_name} ${data.last_name}`}
                </h2>
              ) : (
                <SkeletonFigure
                  className="w-[230px] h-[28px] rounded-[6px] mb-[8px]"
                />
              )}
            </div>
          </div>
          <div
            className="flex flex-col items-stretch gap-[16px] sm:grid sm:grid-cols-[1fr_1fr] sm:gap-x-[24px]"
          >
            <InputBlock
              label="First name"
              errors={profileInfoFormDataErrors.first_name}
              type="text"
              id="first_name_profile_input"
              value={profileInfoFormData.first_name}
              onChange={firstNameInputOnChange}
              required
              name="first_name"
              isLoading={isUserProfileDataLoading}
            />
            <InputBlock
              label="Last name"
              errors={profileInfoFormDataErrors.last_name}
              type="text"
              id="last_name_profile_input"
              value={profileInfoFormData.last_name}
              onChange={lastNameInputOnChange}
              required
              name="last_name"
              isLoading={isUserProfileDataLoading}
            />
          </div>
          <div
            className="flex flex-col items-stretch gap-[16px]"
          >
            <div
              className={clsx(
                'rounded-[6px] border p-[16px] grid grid-cols-[20px_1fr_auto] gap-[12px] items-center',
                isEmailConfirmed ? 'border-input' : ' border-amber-300 bg-amber-50/50',
              )}
            >
              <Mail
                className={clsx(
                  'w-full',
                  isEmailConfirmed ? 'text-blue-500' : 'text-amber-600',
                )}
              />
              <div>
                <p
                  className="text-[14px]"
                >
                  Email
                </p>
                {data?.email ? (
                  <p className="text-[14px] text-gray-600">
                    {data.email}
                  </p>
                ) : (
                  <SkeletonFigure
                    className="w-[180px] h-[21px] rounded-[6px] mt-[4px]"
                  />
                )}
                {!isEmailConfirmed && (
                  <p className="text-[12px] text-amber-600 mt-[4px]">
                    {isSendEmailConfirmationSuccess ? 'A confirmation email has been sent.' : 'Not confirmed'}
                  </p>
                )}
              </div>
              {isEmailConfirmed ? (
                <Button
                  isBlue={false}
                  linkMode={false}
                  type="button"
                  onClick={() => setIsChangeEmailDialogOpen(true)}
                  className="row-[2/3] col-[1/4] 500:row-auto 500:col-auto bg-white"
                  isDisabled={isUserProfileFetching || isUpdateUserProfileLoading}
                >
                  Change
                </Button>
              ) : (
                <div
                  className="row-[2/3] col-[1/4] 500:row-auto 500:col-auto flex flex-col items-center gap-[4px]"
                >
                  <Button
                    isBlue={false}
                    linkMode={false}
                    type="button"
                    onClick={sendEmailConfirmationBtnOnClick}
                    className="bg-white w-full"
                    isDisabled={
                      isUserProfileFetching
                      || emailConfirmationCountDown > 0
                      || isSendEmailConfirmationLoading
                    }
                  >
                    {isSendEmailConfirmationLoading && (
                      <>
                        <Image
                          src={PUBLIC_ASSETS_META.loading_spinner.src}
                          alt={PUBLIC_ASSETS_META.loading_spinner.alt}
                          width={PUBLIC_ASSETS_META.loading_spinner.width}
                          height={PUBLIC_ASSETS_META.loading_spinner.height}
                          className="w-[16px] h-[16px] fill-white"
                        />
                        Sending...
                      </>
                    )}
                    {emailConfirmationCountDown > 0 ? `Resend ${emailConfirmationCountDown}s`
                      : isSendEmailConfirmationSuccess || isSendEmailConfirmationError
                        ? 'Resend' : 'Confirm'}
                  </Button>
                  <ul
                    className="font-inter text-red-500 text-[14px] flex-col items-stretch gap-[8px] mt-[4px]"
                  >
                    {confirmationEmailErrors.map((error) => (
                      <li
                        key={error}
                      >
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <Button
            linkMode={false}
            type="submit"
            className="gap-[8px] self-end"
            isDisabled={isUserProfileFetching}
          >
            {isUpdateUserProfileLoading ? (
              <>
                <Image
                  src={PUBLIC_ASSETS_META.loading_spinner.src}
                  alt={PUBLIC_ASSETS_META.loading_spinner.alt}
                  width={PUBLIC_ASSETS_META.loading_spinner.width}
                  height={PUBLIC_ASSETS_META.loading_spinner.height}
                  className="w-[16px] h-[16px] fill-white"
                />
                Saving...
              </>
            ) : (
              <>
                <Save
                  className="w-[16px] h-[16px]"
                />
                Save changes
              </>
            )}
          </Button>
        </form>
      </main>
      <Dialog
        dialogId={CHANGE_EMAIL_DIALOG_ID}
        isOpen={isChangeEmailDialogOpen}
        closeDialogCb={closeEmailDialog}
        label="Email change menu"
      >
        <form
          className="w-full h-full font-inter flex flex-col items-stretch gap-[24px]"
          onSubmit={changeEmailFormOnSubmit}
          noValidate
        >
          <div className="flex flex-col items-center gap-[6px] text-center">
            <p className="text-[18px] font-semibold leading-none tracking-tight">
              Change email
            </p>
            <p className="text-[14px] text-[#64748b]">
              Enter a new email address
            </p>
          </div>
          <InputBlock
            id="change-email-input"
            label="New email"
            type="email"
            value={newEmailInputValue}
            onChange={newEmailInputOnChange}
            placeholder="email@company.com"
            errors={newEmailInputErrors}
            required
            name="new_email"
          />
          <div
            className="flex flex-col items-stretch gap-[16px]"
          >
            <Button
              type="submit"
              linkMode={false}
              isDisabled={
                isUserProfileFetching
                || emailConfirmationCountDown > 0
                || isSendEmailConfirmationLoading
              }
            >
              {(isSendEmailConfirmationLoading || isUpdateUserProfileLoading) && (
                <>
                  <Image
                    src={PUBLIC_ASSETS_META.loading_spinner.src}
                    alt={PUBLIC_ASSETS_META.loading_spinner.alt}
                    width={PUBLIC_ASSETS_META.loading_spinner.width}
                    height={PUBLIC_ASSETS_META.loading_spinner.height}
                    className="w-[16px] h-[16px] fill-white"
                  />
                  Sending...
                </>
              )}
              {emailConfirmationCountDown > 0 ? `Resend ${emailConfirmationCountDown}s`
                : isSendEmailConfirmationSuccess || isSendEmailConfirmationError
                  ? 'Resend' : 'Send email'}
            </Button>
            <Button
              type="button"
              linkMode={false}
              isBlue={false}
              onClick={closeEmailDialog}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
