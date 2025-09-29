import { useEffect, useRef, useState, type ReactNode } from "react";
import "./dropdown.css";
import { useOutsideClick } from "./useOutsideClick";
import type { Property } from "csstype";
import type { Alignment } from "../../utils/utils";

const Dropdown = ({
  alignment,
  className,
  buttonClass,
  useDefaultButtonStyle,
  dropdownButton,
  backgroundColor,
  onOpenChange,
  getChildren,
  children,
}: {
  alignment?: Alignment;
  className?: string;
  buttonClass?: string;
  useDefaultButtonStyle?: boolean;
  dropdownButton: ReactNode;
  backgroundColor?: Property.BackgroundColor;
  onOpenChange?: (isOpen: boolean) => void;
  getChildren?: (params: {
    setParentScrollEnabled: (enabled: boolean) => void;
    closeDropdown: () => void;
  }) => ReactNode;
  children?: ReactNode;
}) => {
  const [isOpen, setIsOpenState] = useState(false);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const dropdownWrapperRef = useRef<HTMLDivElement>(null);
  const [dropdownContentScroll, setDropdownContentScroll] = useState(0);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(0);
  const [dropdownWrapperHeight, setDropdownWrapperHeight] = useState(0);
  const [scrollEnabled, setScrollEnabledState] = useState(true);

  useEffect(() => {
    const currentContent = dropdownContentRef.current;
    const currentWrapper = dropdownWrapperRef.current;

    const handleScroll = () => {
      if (currentContent) {
        setDropdownContentScroll(currentContent.scrollTop);
      }
    };

    const handleMove = () => {
      if (currentWrapper) {
        // setDropdownWrapperYPos(currentWrapper.getBoundingClientRect().y);
        setDropdownMaxHeight(
          window.innerHeight - currentWrapper.getBoundingClientRect().y
        );
      }
    };

    const handleSize = () => {
      if (currentWrapper) {
        setDropdownWrapperHeight(currentWrapper.getBoundingClientRect().height);
      }
    };

    const sizeObserver = new ResizeObserver((entries) => {
      entries.forEach(() => {
        handleSize();
      });
    });

    if (currentContent) {
      currentContent.addEventListener("scroll", handleScroll);
    }
    if (currentWrapper) {
      sizeObserver.observe(currentWrapper);
    }
    document.addEventListener("scroll", handleMove);
    window.addEventListener("resize", handleMove);

    handleScroll();
    handleMove();
    handleSize();

    return () => {
      if (currentContent) {
        currentContent.removeEventListener("scroll", handleScroll);
      }
      if (currentWrapper) {
        sizeObserver.disconnect();
      }
      document.removeEventListener("scroll", handleMove);
      window.removeEventListener("resize", handleMove);
    };
  }, []);

  const requiresScroll = isOpen && dropdownMaxHeight <= dropdownWrapperHeight;
  // let maxHeight = -1;
  // if (isOpen) {
  //   // maxHeight = dropdownMaxHeight;

  //   requiresScroll = dropdownMaxHeight <= dropdownWrapperHeight;
  // }

  dropdownContentRef.current?.style.setProperty(
    "--offset",
    `${dropdownContentScroll}px`
  );

  dropdownContentRef.current?.style.setProperty(
    "--maxHeight",
    dropdownMaxHeight > 0 ? `${dropdownMaxHeight}px` : "0"
  );

  useDefaultButtonStyle ??= true;
  alignment ??= "left";
  backgroundColor ??= "var(--colNeutral)";

  const isOpenClass = isOpen ? "show" : "hide";
  function setIsOpen(isOpen: boolean) {
    onOpenChange?.call(null, isOpen);
    setIsOpenState(isOpen);
  }

  return (
    <div
      ref={useOutsideClick(() => setIsOpen(false))}
      className={`dropdown ${className}`}
    >
      {useDefaultButtonStyle ? (
        <button className={buttonClass} onClick={() => setIsOpen(!isOpen)}>
          {dropdownButton}
        </button>
      ) : (
        <div className={buttonClass} onClick={() => setIsOpen(!isOpen)}>
          {dropdownButton}
        </div>
      )}
      <div className="arrowContainer">
        <div className={`dropdownMenu ${isOpenClass}`}>
          <div className="dropdownWrapper">
            <div
              className="arrow"
              style={{ backgroundColor: backgroundColor }}
            ></div>
          </div>
        </div>
      </div>
      <div className={`dropdownMenu ${isOpenClass} ${alignment}Align test`}>
        <div ref={dropdownWrapperRef} className="dropdownWrapper">
          <div
            ref={dropdownContentRef}
            className={`dropdownContent shimmerBackground ${
              scrollEnabled && requiresScroll ? "scroll" : ""
            }`}
            style={{
              backgroundColor: backgroundColor,
            }}
          >
            {getChildren?.call(this, {
              setParentScrollEnabled: setScrollEnabledState,
              closeDropdown: () => setIsOpen(false),
            })}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
