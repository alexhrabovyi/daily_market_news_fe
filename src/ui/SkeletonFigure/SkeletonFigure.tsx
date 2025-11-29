import { CSSProperties } from 'react';
import clsx from 'clsx';

interface SkeletonFigureProps {
  className?: string,
  style?: CSSProperties,
  children?: React.ReactNode,
}

export default function SkeletonFigure({ style, children, className }: SkeletonFigureProps) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-neutral-100 dark:bg-neutral-500',
        className,
      )}
      style={style}
    >
      <div
        className="absolute top-0 left-[-150%] w-[150%] h-full animate-shimmer-move
           bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)]"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
