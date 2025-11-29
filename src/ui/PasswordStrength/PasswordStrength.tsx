import clsx from 'clsx';

export enum PasswordStrengthEnum {
  weak = 'weak',
  medium = 'medium',
  strong = 'strong',
}

const STRENGTH_DESC = {
  [PasswordStrengthEnum.weak]: 'Слабкий',
  [PasswordStrengthEnum.medium]: 'Середній',
  [PasswordStrengthEnum.strong]: 'Сильний',
};

const getPasswordStrength = (password: string): PasswordStrengthEnum => {
  if (!password) return PasswordStrengthEnum.weak;

  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 3) return PasswordStrengthEnum.weak;
  if (score <= 5) return PasswordStrengthEnum.medium;

  return PasswordStrengthEnum.strong;
};

interface PasswordStrengthProps {
  password: string,
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="w-full flex items-center gap-[8px]">
      <div className="relative w-full h-[8px] bg-gray-200 overflow-hidden rounded-full">
        <span
          className={clsx(
            'absolute h-full top-0 left-0',
            passwordStrength === PasswordStrengthEnum.weak && 'bg-red-500 w-[33%]',
            passwordStrength === PasswordStrengthEnum.medium && 'bg-yellow-500 w-[66%]',
            passwordStrength === PasswordStrengthEnum.strong && 'bg-green-500 w-full',
          )}
        />
      </div>
      <p className="font-inter text-[12px]">
        {STRENGTH_DESC[passwordStrength]}
      </p>
    </div>
  );
}
