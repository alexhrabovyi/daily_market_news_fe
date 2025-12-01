import { memo, useMemo } from 'react';
import type { Period } from '@/ui/CryptoDashboardContainer/CryptoDashboardContainer';
import type { CryptoPrice } from '@/api/api';
import getDate, { Date } from '@/utils/getDate';
import formatNum from '@/utils/formatNum';
import PeriodButton from '../PeriodButton/PeriodButton';
import GraphAndDates from '../GraphAndDates/GraphAndDates';

interface FormattedDate {
  date: string,
  dateShort: string,
  time: string,
  timeShort: string,
  timezone: string,
}

function formateDate(date: Date): FormattedDate {
  return {
    date: `${date.weekday}, ${date.month} ${date.day}, ${date.year}`,
    dateShort: `${date.day} ${date.month}`,
    time: `${date.hours}:${date.minutes}:${date.seconds}`,
    timeShort: `${date.hours}:${date.minutes}`,
    timezone: 'UTC',
  };
}

export interface FormattedPrice {
  price: number,
  priceFormatted: string,
  date: FormattedDate,
}

interface CryptoHistoryChartProps {
  currentChartPeriod: Period,
  changeCurrentChartPeriodCb: (period: Period) => void,
  unformattedPrices: CryptoPrice[] | undefined,
  cryptoName: string | undefined,
  cryptoSymbol: string | undefined,
}

const CryptoHistoryChart = memo<CryptoHistoryChartProps>(({
  currentChartPeriod,
  changeCurrentChartPeriodCb,
  unformattedPrices,
  cryptoName,
  cryptoSymbol,
}) => {
  const formattedPrices = useMemo<FormattedPrice[] | undefined>(() => {
    if (!unformattedPrices) return;

    return unformattedPrices.map((p) => {
      const date = getDate(p.timestamp);
      const formattedDate = formateDate(date);

      return {
        price: p.price,
        priceFormatted: formatNum(p.price).formattedNum,
        date: formattedDate,
      };
    });
  }, [unformattedPrices]);

  const currentPeriodFormattedPrices = useMemo(() => {
    if (!formattedPrices) return;

    if (currentChartPeriod === '24H') {
      return formattedPrices;
    }

    let startIndex = 0;
    const endIndex = formattedPrices.length;

    if (currentChartPeriod === '1M') {
      startIndex = endIndex - 31;
    } else if (currentChartPeriod === '3M') {
      startIndex = endIndex - 93;
    } else if (currentChartPeriod === '6M') {
      startIndex = endIndex - 186;
    } else if (currentChartPeriod === '1Y') {
      startIndex = 0;
    }

    const currentPaymentStats = formattedPrices.slice(startIndex);

    return currentPaymentStats;
  }, [currentChartPeriod, formattedPrices]);

  const lastPeriodFormattedNum = unformattedPrices && unformattedPrices.length
    ? formatNum(unformattedPrices[unformattedPrices.length - 1].price) : undefined;

  const latestPriceLabelText = `Latest price of ${cryptoName} is $${lastPeriodFormattedNum?.formattedNum}.`;

  return (
    <div
      className="w-full flex flex-col items-stretch gap-[10px] bg-white rounded-lg shadow-sm"
    >
      <div
        className="flex flex-col justify-start items-stertch gap-[10px] p-[18px] 500:p-[24px]"
      >
        <div
          className="flex flex-col 500:flex-row 500:justify-between 500:items-center gap-[10px] 500:gap-0 mb-[10px] 500:mb-0"
        >
          <div
            className="flex items-center gap-[8px]"
          >
            <h2
              className="font-inter font-semibold text-[28px] text-[rgb(15,23,41)]"
            >
              {cryptoName}
            </h2>
            <p
              className="font-inter text-[20px] text-[rgb(101,117,139)]"
            >
              {cryptoSymbol?.toUpperCase()}
            </p>
          </div>
          <div
            className="flex justify-start items-center gap-[8px]"
            role="radiogroup"
            aria-label="Choose period which coin history chart will be shown for"
          >
            <PeriodButton
              btnPeriod="24H"
              currentPeriod={currentChartPeriod}
              changeCurrentChartPeriodCb={changeCurrentChartPeriodCb}
            />
            <PeriodButton
              btnPeriod="1M"
              currentPeriod={currentChartPeriod}
              changeCurrentChartPeriodCb={changeCurrentChartPeriodCb}
            />
            <PeriodButton
              btnPeriod="3M"
              currentPeriod={currentChartPeriod}
              changeCurrentChartPeriodCb={changeCurrentChartPeriodCb}
            />
            <PeriodButton
              btnPeriod="6M"
              currentPeriod={currentChartPeriod}
              changeCurrentChartPeriodCb={changeCurrentChartPeriodCb}
            />
            <PeriodButton
              btnPeriod="1Y"
              currentPeriod={currentChartPeriod}
              changeCurrentChartPeriodCb={changeCurrentChartPeriodCb}
            />
          </div>
        </div>
        <div
          className="flex flex-row 500:flex-col justify-start items-center 500:items-start gap-[10px] flex-wrap"
          aria-live="polite"
          aria-atomic="true"
          aria-busy={!unformattedPrices}
          aria-label={latestPriceLabelText}
        >
          <p
            className="font-inter font-medium text-[38px] 500:text-[32px] text-darkBlue mr-[10px] 500:mr-0"
          >
            {`$${lastPeriodFormattedNum?.integer}`}
            <span className="text-[28px] 500:text-[20px] text-[rgb(101,117,139)]">
              {lastPeriodFormattedNum?.float}
            </span>
          </p>
        </div>
      </div>
      <GraphAndDates
        formattedPrices={currentPeriodFormattedPrices}
        currentChartPeriod={currentChartPeriod}
      />
    </div>
  );
});

CryptoHistoryChart.displayName = 'CryptoHistoryChart';

export default CryptoHistoryChart;
