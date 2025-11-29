/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable react/destructuring-assignment */
import { JSX, memo } from 'react';
import clsx from 'clsx';
import Input, { InputProps } from '@/ui/Input/Input';
import PasswordInput, { PasswordInputProps } from '@/ui/PasswordInput/PasswordInput';
import SkeletonFigure from '@/ui/SkeletonFigure/SkeletonFigure';

interface InputBlockCommonProps {
  label: string,
  errors?: string[],
  className?: string,
  children?: React.ReactNode,
  isLoading?: boolean,
}

interface PasswordInputBlockProps extends InputBlockCommonProps, PasswordInputProps {
  type: 'password',
}

interface OtherInputBlockProps extends InputBlockCommonProps, InputProps { }

function InputBlock(props: OtherInputBlockProps): JSX.Element;
function InputBlock(props: PasswordInputBlockProps): JSX.Element;
function InputBlock(props: OtherInputBlockProps | PasswordInputBlockProps) {
  return (
    <div
      className={clsx(
        props.className,
        'flex flex-col items-start gap-[8px]',
      )}
    >
      <label
        htmlFor={props.id}
        className="font-inter text-[14px] font-medium text-gray-700"
      >
        {props.label}
      </label>
      {
        props.isLoading ? (
          <SkeletonFigure
            className="w-full h-[40px] rounded-[6px]"
          />
        ) : props.type === 'password' ? (
          <PasswordInput
            id={props.id}
            value={props.value}
            onChange={props.onChange}
            isError={!!props.errors?.length}
            required={props.required}
            name={props.name}
            placeholder={props.placeholder}
          />
        ) : (
          <Input
            id={props.id}
            type={props.type}
            value={props.value}
            onChange={props.onChange}
            isError={!!props.errors?.length}
            required={props.required}
            name={props.name}
            placeholder={props.placeholder}
            isDisabled={props.isDisabled}
          />
        )
      }
      {props.children}
      <ul
        className="font-inter text-red-500 text-[14px] flex-col items-stretch gap-[8px]"
      >
        {props.errors?.map((error) => (
          <li
            key={error}
          >
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default memo(InputBlock) as unknown as typeof InputBlock;
