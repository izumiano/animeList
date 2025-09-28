import { useEffect, useRef } from "react";

export const useOutsideClick = <T extends HTMLElement>(
  callback: () => void
) => {
  const ref = useRef<T>(null); // Replace HTMLDivElement with the appropriate element type

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        console.log("close");
        callback();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [callback]);

  return ref;
};
