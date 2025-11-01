import {
	useState,
	type CSSProperties,
	type ElementType,
	type ReactNode,
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
}

export default function RainbowOutline({
	elementType,
	onClick,
	borderSize,
	blurSize,
	animationTime,
	doRotate,
	className,
	children,
}: {
	elementType: ElementType;
	onClick?: () => void;
	borderSize?: number | string;
	blurSize?: number;
	animationTime?: string;
	doRotate?: "always" | "never" | "onHover";
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
			style={
				{
					"--aspectRatio": aspectRatio ?? 1,
					"--borderSize": borderSize,
					"--blurSize": `${blurSize ?? 10}px`,
					"--animationTime": animationTime ?? "4s",
					"--playState": playState,
					"--hoverPlayState": hoverPlayState,
				} as RainbowOutlineCSS
			}
		>
			<div className="rainbow">
				<div></div>
			</div>
			{children}
		</Tag>
	);
}
