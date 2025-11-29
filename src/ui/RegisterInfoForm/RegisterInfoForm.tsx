import Image from 'next/image';
import { useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { RegisterInfo, RegisterInfoErrors } from '@/ui/RegistrationContainer/RegistrationContainer';
import InputBlock from '@/ui/InputBlock/InputBlock';
import Button from '@/ui/Button/Button';
import PasswordStrength from '@/ui/PasswordStrength/PasswordStrength';
import PUBLIC_ASSETS_META from '@/utils/PUBLIC_ASSETS_META';

interface RegisterInfoFormProps {
  registerInfoData: RegisterInfo,
  registerInfoErrors: RegisterInfoErrors,
  updateRegisterInfo: (key: keyof RegisterInfo, value: string) => void
  formOnSubmit: () => void,
  isLoading: boolean
}

const BUTTON_CLASSNAMES = 'gap-[16px]';
const BUTTON_ICON_CLASSNAMES = 'w-[16px] h-[16px]';

export default function RegisterInfoForm({
  registerInfoData, registerInfoErrors, updateRegisterInfo, formOnSubmit, isLoading,
}: RegisterInfoFormProps) {
  const isThereAnyErrors = !!Object.values(registerInfoErrors)
    .filter((errors) => errors.length).length;

  const firstNameInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateRegisterInfo('first_name', e.target.value);
  }, [updateRegisterInfo]);

  const lastNameInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateRegisterInfo('last_name', e.target.value);
  }, [updateRegisterInfo]);

  const emailInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const trimmedEmail = e.target.value.trim();

    updateRegisterInfo('email', trimmedEmail);
  }, [updateRegisterInfo]);

  const passwordInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const trimmedPassword = e.target.value.trim();

    updateRegisterInfo('password', trimmedPassword);
  }, [updateRegisterInfo]);

  const confirmPasswordInputOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const trimmedPassword = e.target.value.trim();

    updateRegisterInfo('confirm_password', trimmedPassword);
  }, [updateRegisterInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isThereAnyErrors) return;

    formOnSubmit();
  };

  return (
    <form
      className="gap-[32px] flex flex-col items-stretch"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="flex flex-col items-start gap-[16px] font-inter">
        <h2 className="font-inter text-black text-[30px] font-bold">
          Personal data
        </h2>
        <p className="font-inter text-gray-600">
          Fill in your personal details to register
        </p>
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-[24px]">
        <InputBlock
          label="First name"
          id="first_name_input"
          type="text"
          value={registerInfoData.first_name}
          onChange={firstNameInputOnChange}
          errors={registerInfoErrors.first_name}
          required
          name="first_name"
          className="col-[1/3] min-[550px]:col-[1/2] md:col-[1/3] min-[950px]:col-[1/2]"
        />
        <InputBlock
          label="Last name"
          id="last_name_input"
          type="text"
          value={registerInfoData.last_name}
          onChange={lastNameInputOnChange}
          errors={registerInfoErrors.last_name}
          required
          name="last_name"
          className="col-[1/3] min-[550px]:col-[2/3] md:col-[1/3] min-[950px]:col-[2/3]"
        />
        <InputBlock
          label="Email"
          id="email_input"
          type="email"
          value={registerInfoData.email}
          onChange={emailInputOnChange}
          errors={registerInfoErrors.email}
          required
          name="email"
          className="col-[1/3]"
        />
        <div
          className="flex flex-col items-stretch gap-[8px] col-[1/3]"
        >
          <InputBlock
            label="Password"
            id="password_input"
            type="password"
            value={registerInfoData.password}
            onChange={passwordInputOnChange}
            errors={registerInfoErrors.password}
            required
            name="password"
          />
          {registerInfoData.password && (
            <PasswordStrength password={registerInfoData.password} />
          )}
        </div>
        <InputBlock
          label="Confirm password"
          id="confirm_password_input"
          type="password"
          value={registerInfoData.confirm_password}
          onChange={confirmPasswordInputOnChange}
          errors={registerInfoErrors.confirm_password}
          required
          name="confirm_password"
          className="col-[1/3]"
        />
      </div>
      <div className="flex justify-between items-center">
        <Button
          linkMode={false}
          className={BUTTON_CLASSNAMES}
          type="submit"
          isDisabled={isLoading || isThereAnyErrors}
        >
          Next
          {isLoading ? (
            <Image
              src={PUBLIC_ASSETS_META.loading_spinner.src}
              alt={PUBLIC_ASSETS_META.loading_spinner.alt}
              width={PUBLIC_ASSETS_META.loading_spinner.width}
              height={PUBLIC_ASSETS_META.loading_spinner.height}
              className="w-[16px] h-[16px] fill-white"
            />
          ) : (
            <ArrowRight
              className={BUTTON_ICON_CLASSNAMES}
            />
          )}
        </Button>
      </div>
    </form>
  );
}
