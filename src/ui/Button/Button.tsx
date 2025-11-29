/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/button-has-type */
import Link from 'next/link';
import { ButtonHTMLAttributes, JSX, memo } from 'react';
import clsx from 'clsx';

interface ButtonCommonProps {
  children: React.ReactNode,
  isDisabled?: boolean,
  isBlue?: boolean,
  className?: string,
  styles?: React.CSSProperties,
}

interface ButtonProps extends ButtonCommonProps {
  linkMode: false,
  ref?: React.RefObject<HTMLButtonElement | null>,
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'],
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
}

interface ButtonLinkModeProps extends ButtonCommonProps {
  linkMode: true,
  href: string,
  ref?: React.RefObject<HTMLAnchorElement | null>,
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void,
}

const BUTTON_CLASSNAMES = {
  common: `flex justify-center items-center rounded-[8px] text-[14px] leading-[24px] 
    font-inter font-medium transition-standart px-[16px] py-[8px] cursor-pointer focus-visible:outline-none 
    focus-visible:ring-2 focus-visible:ring-outline-grey focus-visible:ring-offset-2`,
  blue: 'text-white bg-blue hover:bg-blue-hover active:bg-blue-active',
  white: 'border border-input hover:bg-accent active:bg-accent-active',
  disabled: 'opacity-50 pointer-events-none',
};

function Button(props: ButtonProps): JSX.Element;
function Button(props: ButtonLinkModeProps): JSX.Element;
function Button(props: ButtonProps | ButtonLinkModeProps) {
  const {
    ref,
    children,
    isDisabled = false,
    isBlue = true,
    className,
    styles,
    linkMode,
    onClick,
  } = props;

  if (linkMode) {
    return (
      <Link
        ref={ref}
        className={clsx(
          'no-underline',
          BUTTON_CLASSNAMES.common,
          isBlue ? BUTTON_CLASSNAMES.blue : BUTTON_CLASSNAMES.white,
          isDisabled && BUTTON_CLASSNAMES.disabled,
          className,
        )}
        href={props.href}
        style={styles}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={props.type || 'button'}
      disabled={isDisabled}
      className={clsx(
        BUTTON_CLASSNAMES.common,
        isBlue ? BUTTON_CLASSNAMES.blue : BUTTON_CLASSNAMES.white,
        isDisabled && BUTTON_CLASSNAMES.disabled,
        className,
      )}
      style={styles}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default memo(Button) as unknown as typeof Button;
