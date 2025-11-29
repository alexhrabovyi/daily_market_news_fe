/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  memo, useRef, useState, useDeferredValue,
  useCallback,
  useLayoutEffect,
} from 'react';
import clsx from 'clsx';
import { FocusTrap } from 'focus-trap-react';
import useToggleInteractiveElements from '@/hooks/useToggleInteractiveElements';
import useHideScrollbarOnOpen from '@/hooks/useHideScrollbarOnOpen';
import useOnResize from '@/hooks/useOnResize';
import { X } from 'lucide-react';

interface DialogProps {
  children: React.ReactNode,
  isOpen: boolean,
  closeDialogCb: () => void,
  dialogId: string,
  label: string,
  maxWidth?: number,
  additionalTriggers?: unknown,
}

// additionalTriggers - any value that when changed should re-trigger inferDialogMetrics,
// for example, data that used in dialog, but received after dialog metrics were calculated,
// for example, fetched data.

const Dialog = memo<DialogProps>(({
  children, isOpen = false, closeDialogCb, dialogId, label, maxWidth, additionalTriggers,
}) => {
  const dialogRef = useRef<HTMLElement | null>(null);

  const [dialogBackdrop, setDialogBackdrop] = useState<HTMLDivElement | null>(null);
  const [dialogHeight, setDialogHeight] = useState<null | number>(null);
  const [isDialogOverflow, setIsDialogOverflow] = useState(false);

  // because elements inside modal should be unfocusable / inactive while modal isn't open/active,
  // on initial render all active elements inside modal are unfocusable and the modal closed.
  // FocusTrap requires at least one element to be active at the moment of activating modal, or
  // there will be an error. So the goal is to make elements focusable before FocusTrap receives
  // isOpen=true and starts working. This is achieved by useDeferredValue, so all elements become
  // focusable and only after that FocusTrap receives deffered isActive=true and starts working.
  const defferedIsOpen = useDeferredValue(isOpen);

  useHideScrollbarOnOpen(isOpen);
  useToggleInteractiveElements(dialogBackdrop, isOpen);

  const inferDialogMetrics = useCallback(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    const maximumDialogHeight = window.innerHeight - window.innerHeight * 0.1;
    const realDialogHeight = dialog.scrollHeight;

    if (realDialogHeight > maximumDialogHeight) {
      setDialogHeight(maximumDialogHeight);
      setIsDialogOverflow(true);
    } else {
      setDialogHeight(realDialogHeight);
      setIsDialogOverflow(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalTriggers]);

  useLayoutEffect(inferDialogMetrics, [inferDialogMetrics]);
  useOnResize(inferDialogMetrics);

  function backdropOnClick(e: React.MouseEvent<HTMLElement>) {
    if (e.target === dialogBackdrop) closeDialogCb();
  }

  return (
    <FocusTrap
      active={defferedIsOpen}
    >
      <div
        ref={setDialogBackdrop}
        className={clsx(
          `fixed top-0 left-0 right-0 bottom-0 z-[100] w-full h-full flex justify-center items-center 
            px-[5%] bg-[rgba(10,17,47,0.75)] transition-[opacity] duration-250 ease-in-out`,
          isOpen ? 'opacity-100 pointer-events-all' : 'opacity-0 pointer-events-none',
        )}
        onClick={backdropOnClick}
        tabIndex={-1}
      >
        <aside
          id={dialogId}
          ref={dialogRef}
          className="w-full p-[24px] rounded-[12px] relative bg-white"
          style={{
            height: `${dialogHeight}px`,
            overflowY: isDialogOverflow ? 'scroll' : undefined,
            maxWidth: maxWidth ? `${maxWidth}px` : '510px',
          }}
          aria-hidden={!isOpen}
          role="dialog"
          aria-modal
          aria-label={label}
        >
          <button
            type="button"
            className="absolute top-[8px] right-[8px] cursor-pointer opacity-70 hover:opacity-100 active:opacity-30
          transition-standart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline-grey
          focus-visible:ring-offset-2 rounded-sm"
            aria-label={`Закрити ${label}`}
            onClick={closeDialogCb}
            aria-haspopup="dialog"
          >
            <X className="w-[24px] h-[24px]" />
          </button>
          {children}
        </aside>
      </div>
    </FocusTrap>
  );
});

Dialog.displayName = 'Dialog';

export default Dialog;
