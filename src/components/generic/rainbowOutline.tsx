import {
	type CSSProperties,
	type ElementType,
	type ReactNode,
	useState,
} from "react";
import "./rainbowOutline.css";
import { useDomEvent } from "../../utils/useEvents";
import useMultipleRef from "../../utils/useMultiple";

interface RainbowOutlineCSS extends CSSProperties {
	"--aspectRatio": number;
	"--borderSize": string;
	"--blurSize": string;
	"--animationTime": string;
	"--playState": AnimationPlayState;
	"--hoverPlayState": AnimationPlayState;
	"--mobilePlayState": AnimationPlayState;
}

export default function RainbowOutline({
	elementType,
	onClick,
	borderSize,
	blurSize,
	animationTime,
	doRotate,
	mobileDoRotate,
	disabled,
	className,
	children,
}: {
	elementType: ElementType;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	borderSize?: number | string;
	blurSize?: number;
	animationTime?: string;
	doRotate?: "always" | "never" | "onHover";
	mobileDoRotate?: "always" | "never";
	disabled?: boolean;
	className?: string;
	children: ReactNode;
}) {
	const [aspectRatio, setAspectRatioState] = useState<number | null>(null);

	function setAspectRatio(elem: HTMLElement | null) {
		if (!elem) {
			return;
		}

		const rect = elem.getBoundingClientRect();
		setAspectRatioState(rect.width / rect.height);
	}

	borderSize ??= "1px";
	if (typeof borderSize === "number") {
		borderSize = `${borderSize}px`;
	}

	doRotate ??= elementType === "button" ? "onHover" : "always";
	mobileDoRotate ??= "always";

	let playState: AnimationPlayState;
	let hoverPlayState: AnimationPlayState;

	switch (doRotate) {
		case "always":
			playState = "running";
			hoverPlayState = "running";
			break;
		case "never":
			playState = "paused";
			hoverPlayState = "paused";
			break;
		case "onHover":
			playState = "paused";
			hoverPlayState = "running";
	}

	const Tag = elementType;
	return (
		<Tag
			ref={useMultipleRef(
				useDomEvent({
					event: "resize",
					callback: setAspectRatio,
				}),
				setAspectRatio,
			)}
			className={`rainbowOutline ${className}`}
			onClick={onClick}
			disabled={disabled}
			style={
				{
					"--aspectRatio": aspectRatio ?? 1,
					"--borderSize": borderSize,
					"--blurSize": `${blurSize ?? 10}px`,
					"--animationTime": animationTime ?? "4s",
					"--playState": playState,
					"--hoverPlayState": hoverPlayState,
					"--mobilePlayState":
						mobileDoRotate === "always" ? "running" : "paused",
				} as RainbowOutlineCSS
			}
		>
			<div className="rainbow">
				<div className={mobileDoRotate === "always" ? "mobileAnim" : ""}></div>
			</div>
			<div className="rainbow__content">{children}</div>
		</Tag>
	);
}
