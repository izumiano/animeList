import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import "./dropdown.css";
import type { Property } from "csstype";
import { useOutsideClick } from "../../utils/useEvents";
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
	forceStaticPosition,
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
	forceStaticPosition?: boolean;
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
	const [dropdownMaxHeight, setDropdownMaxHeight] = useState(0);
	const [dropdownWrapperHeight, setDropdownWrapperHeight] = useState(0);
	const [scrollEnabled, setScrollEnabledState] = useState(true);

	useEffect(() => {
		const currentWrapper = dropdownWrapperRef.current;
		const currentList = listRef?.current ?? window;
		const currentScrollElement = scrollElementRef?.current ?? document;

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

		handleMove();
		handleSize();

		return () => {
			if (currentWrapper) {
				sizeObserverHandleSize.disconnect();
			}
			if (currentScrollElement) {
				currentScrollElement.removeEventListener("scroll", handleMove);
			}
			if (currentList) {
				if (currentList instanceof Window) {
					currentList.removeEventListener("resize", handleMove);
				} else {
					sizeObserverHandleMove.disconnect();
				}
			}
		};
	}, [listRef, scrollElementRef]);

	const requiresScroll = dropdownMaxHeight <= dropdownWrapperHeight;

	dropdownContentRef.current?.style.setProperty(
		"--maxHeight",
		dropdownMaxHeight > 0 ? `${dropdownMaxHeight}px` : "0",
	);

	useDefaultButtonStyle ??= true;
	alignment ??= "left";
	backgroundColor ??= "var(--colNeutral)";
	disableScroll ??= false;
	forceStaticPosition ??= false;

	const isOpenClass = isOpen ? "show" : "hide";
	const setIsOpen = useCallback(
		(isOpen: boolean) => {
			onOpenChange?.call(null, isOpen);
			setIsOpenState(isOpen);
		},
		[onOpenChange],
	);

	return (
		<div
			ref={useOutsideClick(useCallback(() => setIsOpen(false), [setIsOpen]))}
			className={`dropdown ${className} ${forceStaticPosition ? "forceStatic" : ""}`}
		>
			{useDefaultButtonStyle ? (
				<button
					className={buttonClass}
					onClick={() => setIsOpenState(!isOpen)}
					{...buttonProps}
				>
					{dropdownButton}
				</button>
			) : (
				<button
					type="button"
					className={`reset ${buttonClass}`}
					onClick={() => setIsOpen(!isOpen)}
				>
					{dropdownButton}
				</button>
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
			<div className={`dropdownMenu ${isOpenClass} ${alignment}Align`}>
				<div ref={dropdownWrapperRef} className="dropdownWrapper">
					<div
						ref={dropdownContentRef}
						className={`dropdownContent shimmerBackground ${dropdownContentClassName}`}
						style={{
							backgroundColor: backgroundColor,
						}}
					>
						<div
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
