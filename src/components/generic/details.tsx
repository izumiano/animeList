import dropdownIcon from "assets/dropdown.png";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import "./details.css";
import { useDomEvent } from "../../utils/useEvents";
import useMultipleRef from "../../utils/useMultiple";

interface DetailsContentCSSProperties extends CSSProperties {
	"--openMaxHeight": string;
}

export default function Details({
	title,
	defaultIsOpen,
	contentClassName,
	children,
}: {
	title: ReactNode;
	defaultIsOpen?: boolean;
	contentClassName?: string;
	children: ReactNode;
}) {
	const [isOpen, setIsOpenState] = useState(defaultIsOpen ?? false);
	const [contentHeight, setContentHeightState] = useState<number | null>(null);

	useEffect(() => {
		setIsOpenState(defaultIsOpen ?? false);
	}, [defaultIsOpen]);

	return (
		<div className={`detailsContainer ${isOpen ? "isOpen" : ""}`}>
			<button
				type="button"
				onClick={() => {
					setIsOpenState((prev) => !prev);
				}}
				className="reset detailsTitle cursorPointer"
			>
				<span>{title}</span>
				<img
					src={dropdownIcon}
					alt="dropdown icon"
					width={25}
					className="smallIcon smallPadding"
				/>
			</button>
			<div
				className="detailsContent"
				style={
					{
						"--openMaxHeight":
							contentHeight != null ? `${contentHeight}px` : "100%",
					} as DetailsContentCSSProperties
				}
			>
				<div
					ref={useMultipleRef(
						useDomEvent({
							event: "resize",
							callback: (elem) => {
								if (!elem) {
									return;
								}
								const computedStyle = window.getComputedStyle(elem);
								setContentHeightState(
									elem.getBoundingClientRect().height +
										parseInt(computedStyle.marginTop) +
										parseInt(computedStyle.marginBottom),
								);
							},
						}),
						(elem) => {
							if (!elem) {
								return;
							}
							const computedStyle = window.getComputedStyle(elem);
							setContentHeightState(
								elem.getBoundingClientRect().height +
									parseInt(computedStyle.marginTop) +
									parseInt(computedStyle.marginBottom),
							);
						},
					)}
					className={contentClassName}
				>
					{children}
				</div>
			</div>
		</div>
	);
}
