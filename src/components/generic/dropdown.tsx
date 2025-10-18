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
	dropdownContentClassName,
	onOpenChange,
	listRef,
	scrollElementRef,
	disableScroll,
	children,
}: {
	dropdownButton: ReactNode;
	alignment?: Alignment;
	className?: string;
	buttonClass?: string;
	buttonProps?: React.ComponentProps<"button">;
	useDefaultButtonStyle?: boolean;
	backgroundColor?: Property.BackgroundColor;
	dropdownContentClassName?: string;
	onOpenChange?: (isOpen: boolean) => void;
	listRef?: React.RefObject<HTMLUListElement | null>;
	scrollElementRef?: React.RefObject<HTMLDivElement | null>;
	disableScroll?: boolean;
	children?:
		| ReactNode
		| ((params: {
				setParentScrollEnabled: (enabled: boolean) => void;
				closeDropdown: () => void;
		  }) => ReactNode);
}) => {
	const [isOpen, setIsOpenState] = useState(false);
	const dropdownContentRef = useRef<HTMLDivElement>(null);
	const dropdownContentScrollRef = useRef<HTMLDivElement>(null);
	const dropdownWrapperRef = useRef<HTMLDivElement>(null);
	const [dropdownContentScroll, setDropdownContentScroll] = useState(0);
	const [dropdownMaxHeight, setDropdownMaxHeight] = useState(0);
	const [dropdownWrapperHeight, setDropdownWrapperHeight] = useState(0);
	const [scrollEnabled, setScrollEnabledState] = useState(true);

	useEffect(() => {
		const currentContentScroll = dropdownContentScrollRef.current;
		const currentWrapper = dropdownWrapperRef.current;
		const currentList = listRef?.current ?? window;
		const currentScrollElement = scrollElementRef?.current ?? document;

		const handleScroll = () => {
			if (currentContentScroll) {
				setDropdownContentScroll(currentContentScroll.scrollTop);
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

		if (currentContentScroll) {
			currentContentScroll.addEventListener("scroll", handleScroll);
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
			if (currentContentScroll) {
				currentContentScroll.removeEventListener("scroll", handleScroll);
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
	disableScroll ??= false;

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
						className={`dropdownContent shimmerBackground ${dropdownContentClassName}`}
						style={{
							backgroundColor: backgroundColor,
						}}
					>
						<div
							ref={dropdownContentScrollRef}
							className={`${scrollEnabled && requiresScroll ? "scroll" : ""}`}
						>
							{typeof children === "function"
								? children({
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
		</div>
	);
};

export default Dropdown;
