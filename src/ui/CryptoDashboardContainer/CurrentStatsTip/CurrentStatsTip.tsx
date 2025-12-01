import {
  useCallback, useLayoutEffect, useMemo, useRef, useState,
} from 'react';

import { DollarSign } from 'lucide-react';
import { TipConfig } from '../GraphAndDates/GraphAndDates';

export interface TipMetrics {
  tipWidth: number,
  tipHeight: number,
  circleWidth: number,
  circleHeight: number,
}

interface StyleParams {
  tipXCoord: number,
  tipYCoord: number,
  triangleXCoord: number,
  triangleYCoord: number,
  triangleClassName: string,
  circleXCoord: number,
  circleYCoord: number,
  verticalLineX: number,
  verticalLineY: number,
  verticalLineHeight: number,
  verticalLinePath: string,
}

export function calcStyleParams(
  tipMetrics: TipMetrics | undefined,
  tipConfig: TipConfig | undefined,
  tipXPadding: number,
  verticalLineWidth: number,
  triangleShortSideWidth: number,
  triangleLongSideWidth: number,
  triangleXPadding: number,
  triangleCircleGap: number,
): StyleParams {
  let tipXCoord = 0;
  let tipYCoord = 0;

  let triangleXCoord = 0;
  let triangleYCoord = 0;
  let triangleClassName = 'absolute transition-[left_top] duration-150 ease-in-out';

  let circleXCoord = 0;
  let circleYCoord = 0;

  let verticalLineX = 0;
  let verticalLineY = 0;
  let verticalLineHeight = 0;
  let verticalLinePath = '';

  if (tipConfig && tipMetrics) {
    const {
      tipWidth, tipHeight, circleWidth, circleHeight,
    } = tipMetrics;

    const statX = tipConfig.x;
    const statY = tipConfig.y;
    const svgWidth = tipConfig.svgElWidth;
    const svgHeight = tipConfig.svgElHeight;

    const isTipRightOverflow = statX + tipWidth / 2 > svgWidth - tipXPadding;
    const isTipLeftOverflow = statX - tipWidth / 2 < tipXPadding;

    circleXCoord = statX - circleWidth / 2;
    circleYCoord = statY - circleHeight / 2;

    verticalLineX = statX - verticalLineWidth / 2;
    verticalLineY = 0;
    verticalLineHeight = svgHeight;
    verticalLinePath = `M 0 0 L 0 ${verticalLineHeight}`;

    if (isTipRightOverflow) {
      tipXCoord = svgWidth - tipXPadding - tipWidth;
      triangleXCoord = statX - tipXCoord - triangleLongSideWidth / 2;

      const isTriangleRightOverflow = triangleXCoord
        + triangleLongSideWidth > tipWidth - triangleXPadding;

      if (isTriangleRightOverflow) {
        tipXCoord = statX
          - (tipWidth + triangleShortSideWidth + triangleCircleGap + circleWidth / 2);
        tipYCoord = statY - tipHeight / 2;

        triangleXCoord = tipWidth;
        triangleYCoord = tipHeight / 2 - triangleLongSideWidth / 2;
        triangleClassName += ' rotate-[-90deg] translate-x-[-20%]';
      } else {
        tipYCoord = statY - (tipHeight + triangleShortSideWidth
          + triangleCircleGap + (circleHeight / 2));

        triangleYCoord = tipHeight;
        triangleClassName += ' translate-y-[-20%]';
      }
    } else if (isTipLeftOverflow) {
      tipXCoord = tipXPadding;
      triangleXCoord = statX - tipXCoord - triangleLongSideWidth / 2;

      const isTriangleLeftOverflow = triangleXCoord < triangleXPadding;

      if (isTriangleLeftOverflow) {
        tipXCoord = statX + triangleShortSideWidth
          + triangleCircleGap + circleWidth / 2;
        tipYCoord = statY - tipHeight / 2;

        triangleXCoord = 0 - triangleShortSideWidth;
        triangleYCoord = tipHeight / 2 - triangleLongSideWidth / 2;
        triangleClassName += ' rotate-[90deg]';
      } else {
        tipYCoord = statY - (tipHeight + triangleShortSideWidth
          + triangleCircleGap + (circleHeight / 2));

        triangleYCoord = tipHeight;
        triangleClassName += ' translate-y-[-20%]';
      }
    } else {
      tipXCoord = statX - tipWidth / 2;

      tipYCoord = statY - (tipHeight + triangleShortSideWidth
        + triangleCircleGap + (circleHeight / 2));

      triangleXCoord = tipWidth / 2 - triangleLongSideWidth / 2;
      triangleYCoord = tipHeight;
      triangleClassName += ' translate-y-[-20%]';
    }
  }

  return {
    tipXCoord,
    tipYCoord,
    triangleXCoord,
    triangleYCoord,
    triangleClassName,
    circleXCoord,
    circleYCoord,
    verticalLineX,
    verticalLineY,
    verticalLineHeight,
    verticalLinePath,
  };
}

interface StatsTipProps {
  id: string,
  isActive: boolean
  tipConfig: TipConfig | undefined,
}

export default function CurrentStatsTip({ id, isActive, tipConfig }: StatsTipProps) {
  const TRIANGLE_LONG_SIDE = 12;
  const TRIANGLE_SHORT_SIDE = 9;
  const GAP_BETWEEN_TRIANGLE_AND_CIRCLE = 6;
  const TIP_X_PADDING = 12;
  const TRIANGLE_X_PADDING = 12;
  const VERTICAL_LINE_WIDTH_PX = 2;

  const tipRef = useRef<HTMLDivElement | null>(null);
  const circleSpanRef = useRef<HTMLSpanElement | null>(null);

  const [tipEl, setTipEl] = useState<HTMLDivElement | null>(null);
  const [circleSpanEl, setCircleSpanEl] = useState<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    if (tipRef.current !== tipEl) {
      setTipEl(tipRef.current);
    }

    if (circleSpanRef.current !== circleSpanEl) {
      setCircleSpanEl(circleSpanRef.current);
    }
  }, [circleSpanEl, tipEl]);

  const inferTipMetrics = useCallback<() => TipMetrics | undefined>(() => {
    if (!tipEl || !circleSpanEl) return;

    const tipWidth = tipEl.offsetWidth;
    const tipHeight = tipEl.offsetHeight;

    const circleWidth = circleSpanEl.offsetWidth;
    const circleHeight = circleSpanEl.offsetHeight;

    return {
      tipWidth,
      tipHeight,
      circleWidth,
      circleHeight,
    };
  }, [circleSpanEl, tipEl]);

  const styleParams = useMemo(() => (
    calcStyleParams(
      inferTipMetrics(),
      tipConfig,
      TIP_X_PADDING,
      VERTICAL_LINE_WIDTH_PX,
      TRIANGLE_SHORT_SIDE,
      TRIANGLE_LONG_SIDE,
      TRIANGLE_X_PADDING,
      GAP_BETWEEN_TRIANGLE_AND_CIRCLE,
    )
  ), [inferTipMetrics, tipConfig]);

  return (
    <>
      <svg
        className="absolute transition-[opacity] duration-150 ease-in-out"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: `${VERTICAL_LINE_WIDTH_PX}px`,
          height: `${styleParams.verticalLineHeight}px`,
          top: `${styleParams.verticalLineY}px`,
          left: `${styleParams.verticalLineX}px`,
          opacity: isActive ? '1' : '0',
          pointerEvents: isActive ? 'all' : 'none',
        }}
      >
        <path
          d={styleParams.verticalLinePath}
          fill="none"
          strokeWidth="4"
          stroke="#CACACE"
          strokeDasharray="5,5"
        />
      </svg>
      <span
        ref={circleSpanRef}
        className="absolute w-[16px] h-[16px] flex justify-center items-center rounded-[50%]
          bg-white shadow-[0_4px_10px_0_rgba(77,100,255,0.5)] transition-[opacity] duration-150 ease-in-out"
        style={{
          top: `${styleParams.circleYCoord}px`,
          left: `${styleParams.circleXCoord}px`,
          opacity: isActive ? '1' : '0',
          pointerEvents: isActive ? 'all' : 'none',
        }}
      >
        <span className="w-[6px] h-[6px] rounded-[50%] bg-blue" />
      </span>
      <div
        id={id}
        className="absolute z-[1] w-auto transition-[left_top_opacity] duration-150 ease-in-out"
        style={{
          top: `${styleParams.tipYCoord}px`,
          left: `${styleParams.tipXCoord}px`,
          opacity: isActive ? '1' : '0',
          pointerEvents: isActive ? 'all' : 'none',
        }}
        role="tooltip"
        aria-live="polite"
        aria-atomic="true"
        aria-busy={!tipConfig}
      >
        <div
          ref={tipRef}
          className={`relative w-full min-w-[200px] flex flex-col justify-start items-start gap-[10px] 
            p-[16px_12px_12px_12px] rounded-[8px] bg-white shadow-[0_20px_40px_0_rgba(208,213,221,0.5)]`}
        >
          <div
            className="flex justify-between gap-[20px]"
          >
            <p
              className="font-inter font-medium text-[12px] text-[#64748b]"
            >
              {tipConfig?.date.date}
            </p>
            <p
              className="font-inter font-medium text-[12px] text-[#64748b]"
            >
              {tipConfig?.date.time}
            </p>
          </div>
          <div className="w-full flex justify-start items-center gap-[8px] p-[8px] rounded-[8px] bg-[#F3F4F7]">
            <span
              className="w-[24px] h-[24px] rounded-[100%] flex justify-center items-center bg-blue"
            >
              <DollarSign
                className="w-[16px] h-[16px] text-white"
              />
            </span>
            <p
              className="font-inter font-medium text-[14px] text-[#566377]"
            >
              Price:
            </p>
            <p
              className="font-inter font-medium text-[16px]"
            >
              {`$${tipConfig?.priceFormatted}`}
            </p>
          </div>
          <svg
            className={styleParams.triangleClassName}
            width={TRIANGLE_LONG_SIDE}
            height={TRIANGLE_SHORT_SIDE}
            viewBox="0 0 12 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              left: `${styleParams.triangleXCoord}px`,
              top: `${styleParams.triangleYCoord}px`,
            }}
          >
            <path d="M7.44115 7.50231C6.65435 8.31998 5.34565 8.31998 4.55885 7.50231L0.598648 3.38675C-0.623995 2.11615 0.27648 1.25385e-06 2.0398 1.11324e-06L9.96019 4.81637e-07C11.7235 3.41023e-07 12.624 2.11614 11.4014 3.38675L7.44115 7.50231Z" fill="white" />
          </svg>
        </div>
      </div>
    </>
  );
}
