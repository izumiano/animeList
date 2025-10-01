import { useEffect, useRef, useState } from "react";

export const useOutsideClick = <T extends HTMLElement>(
  callback: () => void
) => {
  const ref = useRef<T>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (isAdded) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("click", handleClickOutside);
    setIsAdded(true);
  }, [callback, isAdded]);

  return ref;
};
