import { useState } from 'react';
import Input, { InputProps } from '@/ui/Input/Input';
import { Eye, EyeOff } from 'lucide-react';

export type PasswordInputProps = Omit<InputProps, 'type'>;

const ICON_CLASSES = 'w-[20px] h-[20px]';

export default function PasswordInput({
  ref, id, value, onChange, onBeforeInput, onPaste,
  isError = false, required = false, name, placeholder,
}: PasswordInputProps) {
  const [passwordIsShown, setPasswordIsShown] = useState(false);

  const inputType = passwordIsShown ? 'text' : 'password';

  return (
    <div
      className="relative w-full"
    >
      <Input
        ref={ref}
        id={id}
        type={inputType}
        value={value}
        onChange={onChange}
        onBeforeInput={onBeforeInput}
        onPaste={onPaste}
        isError={isError}
        required={required}
        name={name}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setPasswordIsShown((isShown) => !isShown)}
        className="absolute right-[12px] top-[50%] h-full translate-y-[-50%]
          text-gray-400 hover:text-gray-500 active:text-gray-600 cursor-pointer transition-standart
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline-grey
          focus-visible:ring-offset-2"
      >
        {
          passwordIsShown
            ? <EyeOff className={ICON_CLASSES} />
            : <Eye className={ICON_CLASSES} />
        }
      </button>
    </div>
  );
}
