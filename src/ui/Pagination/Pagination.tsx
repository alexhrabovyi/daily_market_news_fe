import { memo } from 'react';
import clsx from 'clsx';
import { DEFAULT_PAGE_SIZE } from '@/api/api';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationBlockProps {
  currentPageNum: number,
  totalElements: number,
  setNumCb: (num: number) => void,
  label: string,
}

const PAGINATION_BTN_CLASSES = `h-[36px] w-[36px] 500:h-[40px] 500:w-[40px] flex items-center justify-center 
gap-[8px] whitespace-nowrap rounded-[6px] font-inter font-medium text-[14px]
transition-standart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline-grey 
focus-visible:ring-offset-2 hover:bg-accent cursor-pointer`;

const ADDITIONAL_PAGINATION_BTN_CLASSES = `h-[36px] w-[36px] 500:h-[40px] 500:w-[40px] flex items-center 
  justify-center rounded-[6px] transition-standart focus-visible:outline-none focus-visible:ring-2 
  focus-visible:ring-outline-grey focus-visible:ring-offset-2 hover:bg-accent cursor-pointer`;

const PREV_NEXT_BTN_CLASSES = `h-[40px] hidden sm:flex items-center justify-center gap-[4px] rounded-[6px] transition-standart 
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline-grey focus-visible:ring-offset-2 
  hover:bg-accent cursor-pointer  font-inter font-medium text-[14px]`;

const Pagination = memo<PaginationBlockProps>(({
  currentPageNum, totalElements, setNumCb, label,
}) => {
  const pageAmount = Math.ceil(totalElements / DEFAULT_PAGE_SIZE);

  const additionalBtnsAvailable = pageAmount > 7;
  const additionalStartBtnNeeded = additionalBtnsAvailable && currentPageNum > 4;
  const additionalEndBtnNeeded = additionalBtnsAvailable && currentPageNum <= pageAmount - 4;

  let firstMainButtonId = 0;
  let lastMainButtonId = 0;

  let additionalStartBtnId = 0;
  let additionalEndBtnId = 0;

  if (additionalBtnsAvailable && !additionalStartBtnNeeded) {
    firstMainButtonId = 1;
    lastMainButtonId = 5;
    additionalEndBtnId = 6;
  } else if (additionalBtnsAvailable && !additionalEndBtnNeeded) {
    firstMainButtonId = pageAmount - 4;
    lastMainButtonId = pageAmount;
    additionalStartBtnId = firstMainButtonId - 1;
  } else if (additionalStartBtnNeeded && additionalEndBtnNeeded) {
    firstMainButtonId = currentPageNum - 1;
    lastMainButtonId = currentPageNum + 1;
    additionalStartBtnId = currentPageNum - 2;
    additionalEndBtnId = currentPageNum + 2;
  } else if (!additionalBtnsAvailable) {
    firstMainButtonId = 1;
    lastMainButtonId = pageAmount;
  }

  const buttons: React.ReactNode[] = [];

  for (let i = firstMainButtonId; i <= lastMainButtonId; i += 1) {
    buttons.push((
      <button
        key={i}
        type="submit"
        onClick={() => setNumCb(i)}
        className={clsx(
          PAGINATION_BTN_CLASSES,
          i === currentPageNum ? 'border border-input bg-white hover:bg-accent' : 'border-transparent',
          pageAmount === 1 && 'pointer-events-none opacity-50',
        )}
        aria-label={`Показати сторінку ${label} номер ${i}`}
        disabled={i === currentPageNum}
      >
        {i}
      </button>
    ));
  }

  const formOnSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
  };

  return (
    <form
      className="flex flex-row items-center gap-[24px]"
      onSubmit={formOnSubmit}
    >
      <button
        type="submit"
        onClick={() => setNumCb(currentPageNum - 1)}
        className={clsx(
          PREV_NEXT_BTN_CLASSES,
          currentPageNum === 1 && 'opacity-30 pointer-events-none',
        )}
        aria-label="Показати попередню сторінку"
        disabled={currentPageNum === 1}
      >
        <ChevronLeft className="w-[16px] h-[16px]" />
        Попередня
      </button>
      <div
        className="flex flex-row items-center gap-[4px]"
      >
        {additionalStartBtnNeeded && (
          <>
            <button
              type="submit"
              onClick={() => setNumCb(1)}
              className={PAGINATION_BTN_CLASSES}
              aria-label={`Показати сторінку ${label} номер 1`}
            >
              {1}
            </button>
            <button
              type="submit"
              onClick={() => setNumCb(additionalStartBtnId)}
              className={ADDITIONAL_PAGINATION_BTN_CLASSES}
              aria-label={`Показати сторінку ${label} номер ${additionalStartBtnId}`}
            >
              <MoreHorizontal className="w-[16px] h-[16px]" />
            </button>
          </>
        )}
        {buttons}
        {additionalEndBtnNeeded && (
          <>
            <button
              type="submit"
              onClick={() => setNumCb(additionalEndBtnId)}
              className={ADDITIONAL_PAGINATION_BTN_CLASSES}
              aria-label={`Показати сторінку ${label} номер ${additionalEndBtnId}`}
            >
              <MoreHorizontal className="w-[16px] h-[16px]" />
            </button>
            <button
              type="submit"
              onClick={() => setNumCb(pageAmount)}
              className={PAGINATION_BTN_CLASSES}
              aria-label={`Показати сторінку ${label} номер ${pageAmount}`}
            >
              {pageAmount}
            </button>
          </>
        )}
      </div>
      <button
        type="submit"
        onClick={() => setNumCb(currentPageNum + 1)}
        className={clsx(
          PREV_NEXT_BTN_CLASSES,
          currentPageNum === pageAmount && 'opacity-30 pointer-events-none',
        )}
        aria-label="Показати наступну сторінку"
        disabled={currentPageNum === pageAmount}
      >
        Наступна
        <ChevronRight className="w-[16px] h-[16px]" />
      </button>
    </form>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
