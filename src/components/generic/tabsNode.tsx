import {
	type CSSProperties,
	isValidElement,
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import "./tabsNode.css";
import type Signal from "../../utils/signal";
import { useDomEvent } from "../../utils/useEvents";
import useMultipleRef from "../../utils/useMultiple";
import useSignal from "../../utils/useSignal";

interface TabsNodeStyle extends CSSProperties {
	"--selectedTabIndex": number;
	"--tabCount": number;
}

export default function TabsNode({
	defaultSelectedTabIndex,
	scrollParent,
	children,
}: {
	defaultSelectedTabIndex?: number;
	scrollParent?: HTMLElement | null;
	children: { tab: ReactNode; content: ReactNode }[];
}) {
	const [{ selectedTabIndex }, setSelectedTabIndexState] = useState({
		selectedTabIndex: defaultSelectedTabIndex ?? 0,
	});

	function setSelectedTabIndex(index?: number) {
		setSelectedTabIndexState({ selectedTabIndex: index ?? 0 });
	}
	const tabHeights = useRef<(number | null)[]>([]);
	const [currentHeight, setCurrentHeightState] = useState(
		tabHeights.current.at(selectedTabIndex),
	);
	const heightSignal = useSignal(
		tabHeights.current.at(selectedTabIndex),
		useCallback(() => {
			setCurrentHeightState(tabHeights.current.at(selectedTabIndex));
		}, [selectedTabIndex]),
	);

	useEffect(() => {
		const height = tabHeights.current.at(selectedTabIndex);
		setCurrentHeightState(height);
		heightSignal.value = height;
	}, [selectedTabIndex, heightSignal]);

	const tabsId = useId();

	if (children.length === 0) {
		return null;
	}

	return (
		<div
			className="tabsNode"
			style={
				{
					"--selectedTabIndex": selectedTabIndex,
					"--tabCount": children.length,
					height: currentHeight ? `${currentHeight}px` : "auto",
				} as TabsNodeStyle
			}
		>
			<div className="tabsContainer">
				{children.map((child, index) => {
					return (
						<button
							key={`${tabsId}${index}_tab`}
							onClick={() => {
								scrollParent?.scroll({ top: 0, behavior: "smooth" });
								setSelectedTabIndex(index);
							}}
							className={index === selectedTabIndex ? "selected" : ""}
						>
							{typeof child.tab === "string" ? (
								<span>{child.tab}</span>
							) : isValidElement(child.tab) && child.tab.type === "img" ? (
								<div>{child.tab}</div>
							) : (
								child.tab
							)}
						</button>
					);
				})}
			</div>
			<div className="tabsContent">
				<div>
					{children.map((child, index) => (
						<TabContent
							key={`${tabsId}${index}_content`}
							index={index}
							tabHeights={tabHeights}
							selected={index === selectedTabIndex}
							heightSignal={heightSignal}
						>
							{child.content}
						</TabContent>
					))}
				</div>
			</div>
		</div>
	);
}

interface TabContentCSSProperties extends CSSProperties {
	"--tabIndex": number;
}

function TabContent({
	index,
	tabHeights,
	selected,
	heightSignal,
	children,
}: {
	index: number;
	tabHeights: React.RefObject<(number | null)[]>;
	selected: boolean;
	heightSignal: Signal<number | null | undefined>;
	children: ReactNode;
}) {
	const updateHeight = useCallback(
		(div: HTMLDivElement | null) => {
			const height = div?.getBoundingClientRect().height ?? null;
			tabHeights.current[index] = height;

			if (selected) {
				heightSignal.notify(height);
			}
		},
		[index, tabHeights, selected, heightSignal],
	);

	return (
		<div
			ref={useMultipleRef(
				updateHeight,
				useDomEvent({
					event: "resize",
					callback: updateHeight,
				}),
			)}
			style={
				{
					"--tabIndex": index,
				} as TabContentCSSProperties
			}
		>
			{children}
		</div>
	);
}
