import {
  memo, useMemo, useRef, useState, useLayoutEffect, useCallback,
} from 'react';
import clsx from 'clsx';
import useOnResize from '@/hooks/useOnResize';
import { ChevronUp } from 'lucide-react';

export interface Option {
  id: string,
  label: string,
}

interface SelectProps {
  options: Option[] | null,
  activeOptionId: string | null,
  optionListDescription: string,
  label: string,
  labelId: string,
  onChange: (id: string) => void,
}

const Select = memo<SelectProps>(({
  options,
  label,
  labelId,
  activeOptionId,
  onChange,
  optionListDescription,
}) => {
  const mainButtonRef = useRef<null | HTMLButtonElement>(null);
  const optionsListRef = useRef<null | HTMLUListElement>(null);

  const [isActive, setIsActive] = useState(false);
  const [optionsContainerHeight, setOptionsContainerHeight] = useState(0);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);

  const activeOption = options?.find((o) => o.id === activeOptionId) || null;

  const inferOptionsContainerHeight = useCallback(() => {
    if (!optionsListRef.current || !options) return;

    setOptionsContainerHeight(optionsListRef.current.offsetHeight);
  }, [options]);

  useLayoutEffect(inferOptionsContainerHeight, [inferOptionsContainerHeight]);
  useOnResize(inferOptionsContainerHeight);

  const mainBtnOnClick = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
      document.addEventListener('click', () => {
        setIsActive(false);
        setFocusedOptionIndex(-1);
      }, { once: true });
      optionsListRef.current?.focus();
    }
  }, [isActive]);

  const optionBtnOnClick = useCallback((optionId: string) => {
    onChange(optionId);
  }, [onChange]);

  const optionListOnKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
    if (!optionsListRef.current || !options) return;

    const optionsList = optionsListRef.current;

    if (e.code === 'ArrowDown') {
      e.preventDefault();

      let newFocusedOptionIndex = focusedOptionIndex + 1;
      if (newFocusedOptionIndex === options.length) newFocusedOptionIndex = 0;

      const childrenElem = optionsList.children[newFocusedOptionIndex]
        .firstElementChild as HTMLButtonElement;
      childrenElem.focus();

      setFocusedOptionIndex(newFocusedOptionIndex);
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();

      let newFocusedOptionIndex = focusedOptionIndex - 1;
      if (newFocusedOptionIndex < 0) newFocusedOptionIndex = options.length - 1;

      const childrenElem = optionsList.children[newFocusedOptionIndex]
        .firstElementChild as HTMLButtonElement;
      childrenElem.focus();

      setFocusedOptionIndex(newFocusedOptionIndex);
    } else if (e.code === 'Home') {
      e.preventDefault();

      const newFocusedOptionIndex = 0;
      const childrenElem = optionsList.children[newFocusedOptionIndex]
        .firstElementChild as HTMLButtonElement;
      childrenElem.focus();

      setFocusedOptionIndex(newFocusedOptionIndex);
    } else if (e.code === 'End') {
      e.preventDefault();

      const newFocusedOptionIndex = options.length - 1;
      const childrenElem = optionsList.children[newFocusedOptionIndex]
        .firstElementChild as HTMLButtonElement;
      childrenElem.focus();

      setFocusedOptionIndex(newFocusedOptionIndex);
    }
  }, [focusedOptionIndex, options]);

  const optionEls = useMemo(() => {
    if (!options) return;

    return options.map((o, i) => (
      <li
        key={o.id}
      >
        <button
          id={o.id}
          type="button"
          className={clsx(
            `flex justify-start items-center w-full p-[6px_8px_6px_16px] font-inter text-[16px] 
          cursor-pointer transition-standart focus-visible:bg-gray-200 focus-visible:outline-none`,
            o.id === activeOptionId ? 'bg-gray-100' : 'bg-white hover:bg-gray-50 active:bg-gray-100',
            i === 0 && 'p-[10px_8px_6px_16px]',
            i === options.length - 1 && 'p-[6px_8px_10px_16px]',
          )}
          onClick={() => {
            optionBtnOnClick(o.id);
            mainButtonRef.current?.focus();
          }}
          role="option"
          aria-selected={o.id === activeOptionId}
          tabIndex={isActive ? 0 : -1}
        >
          {o.label}
        </button>
      </li>
    ));
  }, [options, activeOptionId, isActive, optionBtnOnClick]);

  const optionListId = `${labelId}OptionList`;

  return (
    <div>
      <p
        id={labelId}
        className="font-inter text-[14px] font-medium text-gray-700 mb-[8px] cursor-default"
        onClick={mainBtnOnClick}
        aria-hidden
      >
        {label}
      </p>
      <div
        className="relative w-full h-[40px]"
      >
        <button
          ref={mainButtonRef}
          type="button"
          className="flex justify-between items-center w-full h-[40px] border rounded-[6px] bg-white py-[8px] px-[12px]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        transition-standart border-input hover:border-outline-grey
        focus-visible:ring-outline-grey cursor-pointer font-inter"
          onClick={mainBtnOnClick}
          role="combobox"
          aria-expanded={isActive}
          aria-controls={optionListId}
          aria-labelledby={labelId}
        >
          <p
            className="text-[16px]"
          >
            {activeOption?.label}
          </p>
          <ChevronUp
            className={clsx(
              'w-[20px] h-[20px] transition-standart',
              isActive && 'rotate-180',
            )}
          />
        </button>
        <div
          className="absolute z-[2] bottom-[-4px] overflow-hidden w-full flex-col items-stretch
          rounded-[4px] bg-white shadow-sm translate-y-[100%] transition-standart"
          style={{
            height: isActive ? `${optionsContainerHeight}px` : '0px',
          }}
        >
          <ul
            id={optionListId}
            ref={optionsListRef}
            className="list-none focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-offset-2 focus-visible:ring-outline-grey"
            onKeyDown={optionListOnKeyDown}
            role="listbox"
            aria-activedescendant={activeOptionId || undefined}
            tabIndex={-1}
            aria-label={optionListDescription}
          >
            {optionEls}
          </ul>
        </div>
      </div>
    </div>
  );
});

Select.displayName = 'Selector';

export default Select;
