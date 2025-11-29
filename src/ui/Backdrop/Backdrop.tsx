import { memo } from 'react';
import clsx from 'clsx';

interface BackdropProps {
  isActive: boolean,
  onClick: () => void,
  className?: string,
}

const Backdrop = memo<BackdropProps>(({ isActive, onClick, className }) => (
  <div
    className={clsx(
      'fixed top-0 left-0 z-[100] w-full h-full bg-[rgba(10,17,47,0.75)] transition-[opacity] duration-500 ease-in-out',
      isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      className,
    )}
    onClick={onClick}
    aria-hidden="true"
  />
));

Backdrop.displayName = 'Backdrop';

export default Backdrop;
