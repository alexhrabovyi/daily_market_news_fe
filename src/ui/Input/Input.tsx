import { Ref } from 'react';
import clsx from 'clsx';

export interface InputProps {
  ref?: Ref<HTMLInputElement>,
  id?: string,
  type: 'text' | 'email' | 'password',
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onBeforeInput?: (e: React.InputEvent<HTMLInputElement>) => void,
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void,
  isError?: boolean,
  required?: boolean,
  name?: string,
  placeholder?: string,
  isDisabled?: boolean,
}

export default function Input({
  ref, id, type, value, onChange, onBeforeInput, onPaste,
  isError = false, required = false, name, placeholder, isDisabled,
}: InputProps) {
  return (
    <input
      ref={ref}
      id={id}
      type={type}
      className={clsx(
        `w-full h-[40px] rounded-[6px] border bg-white py-[8px] px-[12px] font-inter
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        transition-standart placeholder:text-muted-foreground`,
        isDisabled ? 'opacity-50 border-input' : isError
          ? 'border-red-500 hover:border-red-700 focus-visible:ring-red-300'
          : 'border-input hover:border-outline-grey focus-visible:ring-outline-grey',
      )}
      value={value}
      onChange={onChange}
      onBeforeInput={onBeforeInput}
      onPaste={onPaste}
      required={required}
      name={name}
      placeholder={placeholder}
      disabled={isDisabled}
    />
  );
}
