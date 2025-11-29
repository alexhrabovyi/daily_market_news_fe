import { useEffect } from 'react';

export default function useOnResize(callback: () => void) {
  useEffect(() => {
    window.addEventListener('resize', callback);

    return () => {
      window.removeEventListener('resize', callback);
    };
  }, [callback]);
}
