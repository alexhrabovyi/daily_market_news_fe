import clsx from 'clsx';
import type { Period } from '@/ui/CryptoDashboardContainer/CryptoDashboardContainer';

interface PeriodButtonProps {
  readonly btnPeriod: Period,
  readonly currentPeriod: Period,
  readonly changeCurrentChartPeriodCb: (period: Period) => void,
}

export default function PeriodButton({
  btnPeriod,
  currentPeriod,
  changeCurrentChartPeriodCb,
}: PeriodButtonProps) {
  const btnStandartClassname = `w-[36px] h-[30px] flex justify-center items-center font-inter 
    text-[14px] border-[1px] border-solid rounded-[8px] transition-standart`;
  const btnInactiveClassName = 'text-[#64748b] hover:text-blue active:text-blue-active border-transparent cursor-pointer';
  const btnActiveClassName = 'bg-[rgb(244,244,245)] border-input font-medium';

  const ariaLabelText: Record<Period, string> = {
    '24H': 'Show payment history chart for the last 24 hours',
    '1M': 'Show payment history chart for the last month',
    '3M': 'Show payment history chart for the last three months',
    '6M': 'Show payment history chart for the last half a year',
    '1Y': 'Show payment history chart for the last year',
  };

  const btnText: Record<Period, string> = {
    '24H': '24H',
    '1M': '1M',
    '3M': '3M',
    '6M': '6M',
    '1Y': '1Y',
  };

  function onClick() {
    if (currentPeriod !== btnPeriod) changeCurrentChartPeriodCb(btnPeriod);
  }

  return (
    <button
      type="button"
      className={clsx(
        btnStandartClassname,
        currentPeriod === btnPeriod ? btnActiveClassName : btnInactiveClassName,
      )}
      onClick={onClick}
      role="radio"
      aria-checked={btnPeriod === currentPeriod}
      aria-label={ariaLabelText[btnPeriod]}
    >
      {btnText[btnPeriod]}
    </button>
  );
}
