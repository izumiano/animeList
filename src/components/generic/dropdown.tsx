import { useEffect, useRef, useState, type ReactNode } from "react";
import "./dropdown.css";
import { useOutsideClick } from "../../utils/useEvents";
import type { Property } from "csstype";
import type { Alignment } from "../../utils/utils";

const Dropdown = ({
	dropdownButton,
	alignment,
	className,
	buttonClass,
	buttonProps,
	useDefaultButtonStyle,
	backgroundColor,
	onOpenChange,
	listRef,
	scrollElementRef,
	children,
}: {
	dropdownButton: ReactNode;
	alignment?: Alignment;
	className?: string;
	buttonClass?: string;
	buttonProps?: React.ComponentProps<"button">;
	useDefaultButtonStyle?: boolean;
	backgroundColor?: Property.BackgroundColor;
	onOpenChange?: (isOpen: boolean) => void;
	listRef?: React.RefObject<HTMLUListElement | null>;
	scrollElementRef?: React.RefObject<HTMLDivElement | null>;
	children?:
		| ReactNode
		| ((params: {
				setParentScrollEnabled: (enabled: boolean) => void;
				closeDropdown: () => void;
		  }) => ReactNode);
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
		const currentList = listRef?.current ?? window;
		const currentScrollElement = scrollElementRef?.current ?? document;

		const handleScroll = () => {
			if (currentContent) {
				setDropdownContentScroll(currentContent.scrollTop);
			}
		};

		const handleMove = () => {
			if (currentWrapper) {
				setDropdownMaxHeight(
					window.innerHeight - currentWrapper.getBoundingClientRect().y,
				);
			}
		};

		const handleSize = () => {
			if (currentWrapper) {
				setDropdownWrapperHeight(currentWrapper.getBoundingClientRect().height);
			}
		};

		const sizeObserverHandleSize = new ResizeObserver((entries) => {
			entries.forEach(() => {
				handleSize();
			});
		});

		if (currentContent) {
			currentContent.addEventListener("scroll", handleScroll);
		}
		if (currentWrapper) {
			sizeObserverHandleSize.observe(currentWrapper);
		}
		if (currentScrollElement) {
			currentScrollElement.addEventListener("scroll", handleMove);
		}
		const sizeObserverHandleMove = new ResizeObserver((entries) => {
			entries.forEach(() => {
				handleMove();
			});
		});
		if (currentList) {
			if (currentList instanceof Window) {
				currentList.addEventListener("resize", handleMove);
			} else {
				sizeObserverHandleMove.observe(currentList);
			}
		}

		handleScroll();
		handleMove();
		handleSize();

		return () => {
			if (currentContent) {
				currentContent.removeEventListener("scroll", handleScroll);
			}
			if (currentWrapper) {
				sizeObserverHandleSize.disconnect();
			}
			if (currentScrollElement) {
				currentScrollElement.removeEventListener("scroll", handleMove);
			}
			if (currentList) {
				sizeObserverHandleMove.disconnect();
			}
		};
	}, [listRef, scrollElementRef]);

	const requiresScroll = isOpen && dropdownMaxHeight <= dropdownWrapperHeight;

	dropdownContentRef.current?.style.setProperty(
		"--offset",
		`${dropdownContentScroll}px`,
	);

	dropdownContentRef.current?.style.setProperty(
		"--maxHeight",
		dropdownMaxHeight > 0 ? `${dropdownMaxHeight}px` : "0",
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
				<button
					className={buttonClass}
					onClick={() => setIsOpen(!isOpen)}
					{...buttonProps}
				>
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
						{typeof children === "function"
							? children?.call(this, {
									setParentScrollEnabled: setScrollEnabledState,
									closeDropdown: () => {
										if (isOpen) setIsOpen(false);
									},
								})
							: children}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dropdown;
