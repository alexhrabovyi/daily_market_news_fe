'use client';

import {
  useState, useCallback, Fragment, useMemo,
} from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { RegisterFormData, useRegisterMutation, RegisterFailedResponse } from '@/api/api';
import SideBanner from '@/ui/SideBanner/SideBanner';
import RegisterInfoForm from '@/ui/RegisterInfoForm/RegisterInfoForm';
import VerifyEmail from '@/ui/VerifyEmail/VerifyEmail';
import {
  emailValidator, passwordValidator, confirmPasswordValidator, fistNameLastNameValidator,
} from '@/utils/validators';
import SITE_LINKS from '@/utils/SITE_LINKS';

export interface RegisterInfo {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export type RegisterInfoErrors = Record<keyof RegisterInfo, string[]>;

const STEP_NUM_CLASSES = {
  common: 'w-[32px] h-[32px] rounded-[50%] flex justify-center items-center font-inter text-[16px]',
  next: 'bg-white/30 text-white',
  current: 'bg-white text-dark-blue',
  finished: 'bg-green-500 text-white',
};

const STEP_SIDE_BANNER_DESCS = [
  'Fill in your personal details to create an account',
  'Check your email to complete registration',
];

export default function RegistrationContainer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<number | null>(null);

  const [registerInfo, setRegisterInfo] = useState<RegisterInfo>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [registerInfoErrors, setRegisterInfoErrors] = useState<RegisterInfoErrors>({
    first_name: [],
    last_name: [],
    email: [],
    password: [],
    confirm_password: [],
  });

  const [
    register, { isLoading: isRegisterLoading },
  ] = useRegisterMutation();

  const validateAndTrimRegisterInfo = () => {
    const newRegisterInfoErrors: RegisterInfoErrors = {
      first_name: [],
      last_name: [],
      email: [],
      password: [],
      confirm_password: [],
    };

    const firstNameTrimmed = registerInfo.first_name.trim();
    const lastNameTrimmed = registerInfo.last_name.trim();

    newRegisterInfoErrors.first_name = fistNameLastNameValidator(firstNameTrimmed);
    newRegisterInfoErrors.last_name = fistNameLastNameValidator(lastNameTrimmed, false);
    newRegisterInfoErrors.email = emailValidator(registerInfo.email);
    newRegisterInfoErrors.password = passwordValidator(registerInfo.password);
    newRegisterInfoErrors.confirm_password = confirmPasswordValidator(
      registerInfo.password,
      registerInfo.confirm_password,
    );

    setRegisterInfo((prevPI) => ({
      ...prevPI,
      first_name: firstNameTrimmed,
      last_name: lastNameTrimmed,
    }));
    setRegisterInfoErrors(newRegisterInfoErrors);

    const isValid = Object.values(newRegisterInfoErrors)
      .filter((errs) => errs.length > 0).length === 0;

    return {
      isValid,
      firstNameTrimmed,
      lastNameTrimmed,
    };
  };

  const stepIndicators = useMemo(() => [1, 2].map((elementStep) => (
    <Fragment
      key={elementStep}
    >
      {elementStep !== 1 && (
        <span
          className={clsx(
            'w-[48px] h-[4px] rounded-[2px]',
            currentStep > elementStep - 1 ? 'bg-green-500' : 'bg-white/30',
          )}
        />
      )}
      <span
        className={clsx(
          STEP_NUM_CLASSES.common,
          currentStep === elementStep ? STEP_NUM_CLASSES.current
            : currentStep > elementStep ? STEP_NUM_CLASSES.finished
              : STEP_NUM_CLASSES.next,
        )}
      >
        {currentStep > elementStep ? '✓' : elementStep}
      </span>
    </Fragment>
  )), [currentStep]);

  const handleNextStep = useCallback(() => setCurrentStep((cS) => cS + 1), []);

  const updateRegisterInfo = useCallback((key: keyof RegisterInfo, value: string) => {
    setRegisterInfo((prev) => ({ ...prev, [key]: value }));

    if (registerInfoErrors[key].length) {
      setRegisterInfoErrors((prev) => ({ ...prev, [key]: [] }));
    }
  }, [registerInfoErrors]);

  const registerUser = async () => {
    const { isValid, firstNameTrimmed, lastNameTrimmed } = validateAndTrimRegisterInfo();

    if (!isValid) return;

    const newRegisterInfoCopy: Partial<RegisterInfo> = {
      ...registerInfo,
      first_name: firstNameTrimmed,
      last_name: lastNameTrimmed,
    };
    delete newRegisterInfoCopy.confirm_password;
    const newRegisterInfoCopyForRequest: RegisterFormData = newRegisterInfoCopy as RegisterFormData;

    try {
      const registerUserResp = await register(newRegisterInfoCopyForRequest).unwrap();

      if ('user_id' in registerUserResp) {
        setUserId(registerUserResp.user_id);
      }

      handleNextStep();
    } catch (err) {
      const e = err as RegisterFailedResponse;

      if (e.data) {
        setRegisterInfoErrors((prev) => ({
          ...prev,
          ...e.data,
        }));
      }
    }
  };

  const backToPersonalInfoForm = useCallback(() => {
    setCurrentStep(1);
  }, []);

  return (
    <div
      className="md:flex min-h-screen"
    >
      <SideBanner>
        <div className="w-full flex flex-col">
          <h1 className="font-inter text-[48px] text-white mb-[24px] leading-[1.2] font-bold">
            {currentStep === 2 ? 'Almost done!' : 'Join our platform'}
          </h1>
          <p className="font-inter text-[20px] text-white/70">
            {STEP_SIDE_BANNER_DESCS[currentStep - 1]}
          </p>
          <div className="mt-[48px] flex items-center gap-[8px]">
            {stepIndicators}
          </div>
        </div>
      </SideBanner>
      <main
        className="w-full standart-padding pt-[64px] pb-[64px] xl:pt-[100px] xl:pb-[100px] bg-white
          flex flex-col items-center gap-[30px]"
      >
        <div
          className="w-full max-w-[460px]"
        >
          {currentStep === 1 && (
            <RegisterInfoForm
              registerInfoData={registerInfo}
              registerInfoErrors={registerInfoErrors}
              updateRegisterInfo={updateRegisterInfo}
              formOnSubmit={registerUser}
              isLoading={isRegisterLoading}
            />
          )}
          {currentStep === 2 && (
            <VerifyEmail
              userId={userId}
              email={registerInfo.email}
              anotherEmailBtnOnClick={backToPersonalInfoForm}
            />
          )}
        </div>
        <div className="flex justify-center items-center gap-[4px] font-inter text-[14px] text-black">
          Already have an account?
          <Link
            href={SITE_LINKS.login}
            className="font-medium text-blue-500 hover:underline active:text-blue-active transition-standart"
          >
            Log in
          </Link>
        </div>
      </main>
    </div>
  );
}
