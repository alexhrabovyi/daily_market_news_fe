/* eslint-disable no-param-reassign */
import { useEffect } from 'react';
import findAllInteractiveElements from '@/utils/findAllInteractiveElements';

export default function useToggleInteractiveElements(
  containerEl: HTMLElement | null | undefined,
  isActive: boolean,
) {
  useEffect(() => {
    if (!containerEl) return;

    const interactiveElements = Array.from(findAllInteractiveElements(containerEl));

    if (isActive) {
      interactiveElements.forEach((el) => {
        el.tabIndex = 0;
        el.ariaHidden = 'false';
      });
    } else {
      interactiveElements.forEach((el) => {
        el.tabIndex = -1;
        el.ariaHidden = 'true';
      });
    }
  }, [containerEl, isActive]);
}
