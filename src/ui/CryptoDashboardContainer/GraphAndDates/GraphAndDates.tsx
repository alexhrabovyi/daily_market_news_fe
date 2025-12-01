/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable default-case */
import {
  memo, useRef, useLayoutEffect, useCallback, useState,
  useMemo,
} from 'react';
import useOnResize from '@/hooks/useOnResize';
import {
  calcMinMaxPrice,
  calcMinMaxCoords,
  calcXYSteps,
  createPricesWithCoords,
  createGraphElems,
  createDateElems,
} from '@/utils/graphAndDatesUtils';
import { FormattedPrice } from '../CryptoHistoryChart/CryptoHistoryChart';
import { Period } from '../CryptoDashboardContainer';
import CurrentStatsTip from '../CurrentStatsTip/CurrentStatsTip';

export interface FormattedPriceWithCoords extends FormattedPrice {
  x: number,
  y: number,
}

export interface SvgMetrics {
  width: number,
  height: number,
  pageX: number,
  pageY: number,
}

export interface StrokeProps {
  width: string,
  color: string,
  linejoin: 'round' | 'miter' | 'bevel' | 'inherit',
  strokeLinecap: 'butt' | 'square' | 'round'
}

export interface FillProps {
  color: string,
  opacity: string,
}

export interface TipConfig extends FormattedPriceWithCoords {
  svgElWidth: number,
  svgElHeight: number,
}

export function inferNewActivePriceIndex(
  pricesWithCoords: FormattedPriceWithCoords[] | undefined,
  XStep: number | undefined,
  x: number,
) {
  if (!pricesWithCoords || !XStep) return;

  const halfOfXStep = XStep / 2;

  if (x <= 0) {
    return 0;
  }

  if (x >= pricesWithCoords[pricesWithCoords.length - 1].x) {
    return pricesWithCoords.length - 1;
  }

  for (let i = 0; i < pricesWithCoords.length; i += 1) {
    const currentPriceMinX = pricesWithCoords[i].x - halfOfXStep;
    const currentPriceMaxX = pricesWithCoords[i].x + halfOfXStep;

    if (x >= currentPriceMinX && x <= currentPriceMaxX) {
      return i;
    }
  }
}

const GRAPH_AND_DATES_EL_ID = 'graphAndDatesEl';
const STATS_TIP_ID = 'statsTip';

const BOTTOM_INDENT_PERCENT = 0.1;
const DATES_OFFSET_X_PX = 50;
const STROKE_PROPS: StrokeProps = {
  width: '2',
  color: '#2563eb',
  linejoin: 'round',
  strokeLinecap: 'round',
};
const FILL_PROPS: FillProps = {
  color: 'url(#blueGradient)',
  opacity: '0.3',
};

interface GraphAndDatesProps {
  readonly formattedPrices: FormattedPrice[] | undefined;
  currentChartPeriod: Period,
}

const GraphAndDates = memo<GraphAndDatesProps>(({
  formattedPrices, currentChartPeriod,
}) => {
  const graphAndDatesRef = useRef<null | HTMLDivElement>(null);
  const svgWrapperRef = useRef<null | HTMLDivElement>(null);

  const [graphAndDatesEl, setGraphAndDatesEl] = useState<HTMLDivElement | null>(null);
  const [svgMetrics, setSvgMetrics] = useState<SvgMetrics | null>(null);
  const [isTipActive, setIsTipActive] = useState(false);
  const [activePriceIndex, setActivePriceIndex] = useState(0);

  useLayoutEffect(() => {
    if (graphAndDatesRef.current !== graphAndDatesEl) {
      setGraphAndDatesEl(graphAndDatesRef.current);
    }
  }, [graphAndDatesEl]);

  const inferSvgMetrics = useCallback(() => {
    const svgWrapperEl = svgWrapperRef.current;

    if (!svgWrapperEl) return;

    const height = svgWrapperEl.offsetHeight;
    const width = svgWrapperEl.offsetWidth;

    const { x: windowX, y: windowY } = svgWrapperEl.getBoundingClientRect();
    const pageX = windowX + window.scrollX;
    const pageY = windowY + window.scrollY;

    setSvgMetrics({
      width,
      height,
      pageX,
      pageY,
    });
  }, []);

  useLayoutEffect(inferSvgMetrics, [inferSvgMetrics]);
  useOnResize(inferSvgMetrics);

  const svgWidth = svgMetrics?.width || 0;

  let amountOfMiddleDates: number;

  if (svgWidth >= 1000) {
    amountOfMiddleDates = 8;
  } else if (svgWidth >= 700) {
    amountOfMiddleDates = 6;
  } else if (svgWidth >= 400) {
    amountOfMiddleDates = 4;
  } else if (svgWidth >= 300) {
    amountOfMiddleDates = 2;
  } else {
    amountOfMiddleDates = 1;
  }

  const minMaxPrice = useMemo(() => calcMinMaxPrice(formattedPrices), [formattedPrices]);
  const minMaxCoords = useMemo(
    () => calcMinMaxCoords(BOTTOM_INDENT_PERCENT, svgMetrics),
    [svgMetrics],
  );

  const XYSteps = useMemo(
    () => calcXYSteps(minMaxPrice, minMaxCoords, formattedPrices?.length),
    [formattedPrices?.length, minMaxCoords, minMaxPrice],
  );

  const xStep = XYSteps?.xStep;

  const pricesWithCoords = useMemo(
    () => createPricesWithCoords(formattedPrices, minMaxPrice, minMaxCoords, XYSteps),
    [XYSteps, formattedPrices, minMaxCoords, minMaxPrice],
  );

  const graphElems = useMemo(
    () => createGraphElems(
      pricesWithCoords,
      minMaxCoords,
      STROKE_PROPS,
      FILL_PROPS,
    ),
    [pricesWithCoords, minMaxCoords],
  );

  const dateElems = useMemo(() => createDateElems(
    pricesWithCoords,
    svgMetrics?.width,
    DATES_OFFSET_X_PX,
    amountOfMiddleDates,
    currentChartPeriod,
  ), [pricesWithCoords, svgMetrics, amountOfMiddleDates, currentChartPeriod]);

  const tipConfig = useMemo(() => {
    if (!pricesWithCoords || !svgMetrics) return;

    let currentActiveIndex = activePriceIndex;

    if (currentActiveIndex >= pricesWithCoords.length) {
      currentActiveIndex = 0;
      setActivePriceIndex(currentActiveIndex);
    }

    const activeStats = pricesWithCoords[currentActiveIndex];

    const newTipConfig: TipConfig = {
      ...activeStats,
      svgElHeight: svgMetrics.height,
      svgElWidth: svgMetrics.width,
    };

    return newTipConfig;
  }, [activePriceIndex, pricesWithCoords, svgMetrics]);

  function onGraphAndDatesFocus() {
    setIsTipActive(true);
  }

  function onGraphAndDatesBlur() {
    setIsTipActive(false);
  }

  function onGraphAndDatesKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!pricesWithCoords) return;

    const suitableKeyboardCodes = [
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];

    const { code } = e;

    if (suitableKeyboardCodes.includes(code)) {
      e.preventDefault();

      let newActivePriceIndex: number;

      switch (code) {
        case 'ArrowLeft':
        case 'ArrowDown':
          newActivePriceIndex = activePriceIndex - 1;
          if (newActivePriceIndex < 0) newActivePriceIndex = 0;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          newActivePriceIndex = activePriceIndex + 1;
          if (newActivePriceIndex === pricesWithCoords.length) {
            newActivePriceIndex = pricesWithCoords.length - 1;
          }
          break;
        case 'PageDown':
          newActivePriceIndex = activePriceIndex - 5;
          if (newActivePriceIndex < 0) newActivePriceIndex = 0;
          break;
        case 'PageUp':
          newActivePriceIndex = activePriceIndex + 5;
          if (newActivePriceIndex >= pricesWithCoords.length) {
            newActivePriceIndex = pricesWithCoords.length - 1;
          }
          break;
        case 'Home':
          newActivePriceIndex = pricesWithCoords.length - 1;
          break;
        case 'End':
          newActivePriceIndex = 0;
          break;
      }

      setActivePriceIndex(newActivePriceIndex!);
    }
  }

  function onGraphAndDatesMove(e: PointerEvent) {
    e.preventDefault();

    const { clientX } = e;

    if (!clientX || !svgMetrics) return;

    const currentSvgX = clientX - svgMetrics.pageX;

    const newIndex = inferNewActivePriceIndex(pricesWithCoords, xStep, currentSvgX);

    setActivePriceIndex(newIndex!);
  }

  function onGraphAndDatesOut(e: PointerEvent) {
    const nextElem = (e.relatedTarget as HTMLElement | null)?.closest('#graphAndDatesBlock');

    if (!nextElem && graphAndDatesEl) {
      graphAndDatesEl.removeEventListener('pointermove', onGraphAndDatesMove);
      graphAndDatesEl.removeEventListener('pointerout', onGraphAndDatesOut);

      setIsTipActive(false);
    }
  }

  function onGraphAndDatesOver(e: React.PointerEvent<HTMLDivElement>) {
    const { clientX, pointerType, pointerId } = e;

    if (!graphAndDatesEl || pointerType !== 'mouse' || !clientX || !svgMetrics) return;

    const prevElem = (e.relatedTarget as HTMLElement | null)?.closest('#graphAndDatesBlock');

    if (!prevElem) {
      const currentSvgX = clientX - svgMetrics.pageX;
      const newIndex = inferNewActivePriceIndex(pricesWithCoords, xStep, currentSvgX);

      setActivePriceIndex(newIndex!);
      setIsTipActive(true);

      graphAndDatesEl.setPointerCapture(pointerId);

      graphAndDatesEl.addEventListener('pointermove', onGraphAndDatesMove);
      graphAndDatesEl.addEventListener('pointerout', onGraphAndDatesOut);
    }
  }

  function onGraphAndDatesUp() {
    if (!graphAndDatesEl) return;

    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';

    graphAndDatesEl.removeEventListener('pointermove', onGraphAndDatesMove);
    graphAndDatesEl.removeEventListener('pointerup', onGraphAndDatesUp);

    setIsTipActive(false);
  }

  function onGraphAndDatesDown(e: React.PointerEvent<HTMLDivElement>) {
    const { clientX, pointerType, pointerId } = e;

    if (graphAndDatesEl && clientX && svgMetrics && pointerType !== 'mouse') {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';

      const currentSvgX = clientX - svgMetrics.pageX;
      const newIndex = inferNewActivePriceIndex(pricesWithCoords, xStep, currentSvgX);

      setActivePriceIndex(newIndex!);
      setIsTipActive(true);

      graphAndDatesEl.setPointerCapture(pointerId);

      graphAndDatesEl.addEventListener('pointermove', onGraphAndDatesMove);
      graphAndDatesEl.addEventListener('pointerup', onGraphAndDatesUp);
    }
  }

  return (
    <div
      ref={graphAndDatesRef}
      id={GRAPH_AND_DATES_EL_ID}
      className="relative w-full h-full flex flex-col justify-start items-start gap-[16px] touch-none"
      onFocus={onGraphAndDatesFocus}
      onBlur={onGraphAndDatesBlur}
      onKeyDown={onGraphAndDatesKeyDown}
      onPointerOver={onGraphAndDatesOver}
      onPointerDown={onGraphAndDatesDown}
      tabIndex={0}
      aria-label="This is a chart for the chosen period.
          You can use keyboard arrows and other keys to change day which payment information is displayed for."
      aria-describedby={STATS_TIP_ID}
    >
      <CurrentStatsTip
        id={STATS_TIP_ID}
        isActive={isTipActive}
        tipConfig={tipConfig}
      />
      <div
        ref={svgWrapperRef}
        className="w-full h-full"
      >
        <svg
          className="w-full h-full min-h-[265px]"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="blueGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#2563eb" stopOpacity="0.7" />
              <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          {graphElems}
        </svg>
      </div>
      <div
        className="relative w-full px-[18px] 500:px-[24px] pb-[24px] flex justify-between items-center font-inter text-[12px] text-grey-400"
        data-testid="dateElemsBlock"
      >
        {dateElems}
      </div>
    </div>
  );
});

GraphAndDates.displayName = 'FormattedPrice';

export default GraphAndDates;
