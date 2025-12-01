import { Period } from '@/ui/CryptoDashboardContainer/CryptoDashboardContainer';
import { FormattedPrice } from '@/ui/CryptoDashboardContainer/CryptoHistoryChart/CryptoHistoryChart';
import {
  FillProps, FormattedPriceWithCoords, StrokeProps, SvgMetrics,
} from '@/ui/CryptoDashboardContainer/GraphAndDates/GraphAndDates';

export interface MinMaxPrice {
  minPrice: number,
  maxPrice: number,
}

export interface MinMaxCoords {
  minYCoord: number,
  maxYCoord: number,
  minXCoord: number,
  maxXCoord: number,
}

export interface XYSteps {
  xStep: number,
  yStep: number,
}

export function calcMinMaxPrice(
  formattedPrices: FormattedPrice[] | undefined,
): MinMaxPrice | undefined {
  if (!formattedPrices || !formattedPrices.length) return;

  const allPrices = formattedPrices.map((p) => p.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  return {
    minPrice,
    maxPrice,
  };
}

export function calcMinMaxCoords(
  bottomIndentPercent: number,
  svgMetrics: SvgMetrics | null,
): MinMaxCoords | undefined {
  if (!svgMetrics) return;

  const minYCoord = 40;
  const maxYCoord = svgMetrics.height * (1 - bottomIndentPercent);
  const minXCoord = 0;
  const maxXCoord = svgMetrics.width;

  return {
    minYCoord,
    maxYCoord,
    minXCoord,
    maxXCoord,
  };
}

export function calcXYSteps(
  minMaxPrice: MinMaxPrice | undefined,
  minMaxCoords: MinMaxCoords | undefined,
  pricesCount: number | undefined,
): XYSteps | undefined {
  if (!minMaxPrice || !minMaxCoords || !pricesCount) return;

  const {
    minXCoord, maxXCoord, minYCoord, maxYCoord,
  } = minMaxCoords;
  const { minPrice, maxPrice } = minMaxPrice;

  const xStep = (maxXCoord - minXCoord) / (pricesCount - 1);
  const yStep = (maxYCoord - minYCoord) / (maxPrice - minPrice);

  return {
    xStep,
    yStep,
  };
}

export function calcXCoord(indexInArray: number, xStep: number) {
  return indexInArray * xStep;
}

export function calcYCoord(
  currentPrice: number,
  minPrice: number,
  yStep: number,
  maxYCoord: number,
) {
  return Math.abs((currentPrice - minPrice) * yStep - maxYCoord);
}

export function createPricesWithCoords(
  prices: FormattedPrice[] | undefined,
  minMaxPrice: MinMaxPrice | undefined,
  minMaxCoords: MinMaxCoords | undefined,
  xYSteps: XYSteps | undefined,
) {
  if (!prices || !minMaxPrice || !minMaxCoords || !xYSteps) return;

  const { minPrice } = minMaxPrice;
  const { maxYCoord } = minMaxCoords;
  const { xStep, yStep } = xYSteps;

  const newStatsCoords: FormattedPriceWithCoords[] = prices
    .map((s, i) => ({
      ...s,
      x: calcXCoord(i, xStep),
      y: calcYCoord(s.price, minPrice, yStep, maxYCoord),
    }));

  return newStatsCoords;
}

export function startPath(x: number, y: number) {
  return `M ${x} ${y}`;
}

export function createGraphElems(
  pricesWithCoords: FormattedPriceWithCoords[] | undefined,
  minMaxCoords: MinMaxCoords | undefined,
  strokeProps: StrokeProps,
  fillProps: FillProps,
) {
  if (!pricesWithCoords || !minMaxCoords) return;

  const {
    minXCoord, maxXCoord, maxYCoord,
  } = minMaxCoords;
  const periodsCount = pricesWithCoords.length;

  let strokeStr = '';
  let fillStr = '';

  pricesWithCoords.forEach((p, i) => {
    const { x: currentX, y: currentY } = p;

    if (i === 0) {
      strokeStr = startPath(currentX, currentY);
    } else if (i === periodsCount - 1) {
      strokeStr += ` L ${currentX} ${currentY}`;
      fillStr = `${strokeStr} L ${maxXCoord} ${maxYCoord} L ${minXCoord} ${maxYCoord} Z`;
    } else {
      strokeStr += ` L ${currentX} ${currentY}`;
    }
  });

  return [
    <path
      key={strokeStr}
      d={strokeStr}
      fill="none"
      strokeWidth={strokeProps.width}
      stroke={strokeProps.color}
      strokeLinejoin={strokeProps.linejoin}
      strokeLinecap={strokeProps.strokeLinecap}
    />,
    <path
      key={fillStr}
      d={fillStr}
      fill={fillProps.color}
      stroke="none"
      opacity={fillProps.opacity}
    />,
  ];
}

export function createDateElems(
  pricesWithCoords: FormattedPriceWithCoords[] | undefined,
  svgWidth: number | undefined,
  offsetX: number,
  amountOfMiddleDates: number,
  currentChartPeriod: Period,
) {
  if (!pricesWithCoords || !svgWidth) return;

  const startX = offsetX;
  const endX = svgWidth - offsetX;

  let firstSuitableStatIndex: number;

  let firstSuitablePrice: FormattedPriceWithCoords;
  let lastSuitablePrice: FormattedPriceWithCoords;

  for (let i = 1; i < pricesWithCoords.length; i += 1) {
    const currentStat = pricesWithCoords[i];

    if (currentStat.x >= startX) {
      const prevStat = pricesWithCoords[i - 1];
      const prevStatXDiff = startX - prevStat.x;
      const currentStatXDiff = currentStat.x - startX;

      if (prevStatXDiff < currentStatXDiff) {
        firstSuitableStatIndex = i - 1;
        firstSuitablePrice = prevStat;
      } else {
        firstSuitableStatIndex = i;
        firstSuitablePrice = currentStat;
      }

      break;
    }
  }

  for (let i = pricesWithCoords.length - 2; i >= 0; i -= 1) {
    const currentStat = pricesWithCoords[i];

    if (currentStat.x <= endX) {
      const nextStat = pricesWithCoords[i + 1];
      const nextStatXDiff = nextStat.x - endX;
      const currentStatXDiff = endX - currentStat.x;

      if (nextStatXDiff < currentStatXDiff) {
        lastSuitablePrice = nextStat;
      } else {
        lastSuitablePrice = currentStat;
      }

      break;
    }
  }

  const middleDatesStartX = firstSuitablePrice!.x;
  const middleDatesEndX = lastSuitablePrice!.x;

  const xStep = (middleDatesEndX - middleDatesStartX) / (amountOfMiddleDates + 1);

  const middleDatesBreakpoints = [];

  for (let i = 1; i <= amountOfMiddleDates; i += 1) {
    const breakPoint = middleDatesStartX + xStep * i;
    middleDatesBreakpoints.push(breakPoint);
  }

  let currentBreakPointIndex = 0;
  const middleDates: FormattedPriceWithCoords[] = [];

  for (let i = firstSuitableStatIndex! + 1; i < pricesWithCoords.length; i += 1) {
    const currentBreakPoint = middleDatesBreakpoints[currentBreakPointIndex];

    if (!currentBreakPoint) break;

    const currentStatX = pricesWithCoords[i].x;
    const prevStatX = pricesWithCoords[i - 1].x;

    if (currentStatX > currentBreakPoint) {
      const currentStatDiffer = currentStatX - currentBreakPoint;
      const prevStatDiffer = currentBreakPoint - prevStatX;

      if (prevStatDiffer < currentStatDiffer) {
        middleDates.push(pricesWithCoords[i - 1]);
      } else {
        middleDates.push(pricesWithCoords[i]);
      }

      currentBreakPointIndex += 1;
    }
  }

  const suitablePrices = [firstSuitablePrice!, ...middleDates, lastSuitablePrice!];

  const newDateElems = suitablePrices.map((sP) => {
    let text = '';

    if (currentChartPeriod === '24H') {
      text = sP.date.timeShort;
    } else {
      text = sP.date.dateShort;
    }

    return (
      <p
        key={sP.x}
        style={{
          position: 'absolute',
          left: `${sP.x}px`,
          transform: 'translateX(-50%)',
        }}
      >
        {text}
      </p>
    );
  });

  return newDateElems;
}
