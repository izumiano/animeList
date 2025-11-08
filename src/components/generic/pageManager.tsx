import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import useMultipleRef from "../../utils/useMultiple";
import useTouch, {
	type OnTouchEndType,
	type OnTouchMoveType,
} from "../../utils/useTouch";
import { fullScreenWidth } from "../../utils/utils";
import { toast } from "react-toastify";
import { useWindowEvent } from "../../utils/useEvents";
import "./pageManager.css";

type PagePropsRet<Page extends string> = {
	[Key in Page]: {
		checkValidity?: (path: string) => { valid: boolean };
		node: ReactNode;
	};
};

type PageProps<Page extends string> = (_: {
	setCurrentPage: (page: Page | "main") => void;
	pageFailed: (errorMessage?: ReactNode) => void;
}) => PagePropsRet<Page>;

export default function PageManager<Page extends string>({
	startPage,
	children,
}: {
	startPage?: Page;
	children: PageProps<Page | "main">;
}) {
	const pageManagerRef = useRef<HTMLDivElement>(null);
	const [currentPage, setCurrentPageState] = useState<Page | "main">(
		startPage ?? "main",
	);
	const [currentOverlayPage, setCurrentOverlayPageState] = useState<
		Page | undefined
	>(startPage);
	const [isHidden, setIsHiddenState] = useState(currentPage === "main");

	const setCurrentPage = useCallback((page: Page | "main") => {
		setCurrentPageState(page);

		if (page !== "main") {
			setCurrentOverlayPageState(page);
			setIsHiddenState(false);
		}
	}, []);

	const pageFailed = useCallback(
		(errorMessage?: ReactNode) => {
			if (errorMessage) {
				toast.error(errorMessage);
			}

			if (currentPage === currentOverlayPage) {
				history.pushState(null, "", "/");
				setCurrentPage("main");
			}
		},
		[currentOverlayPage, currentPage, setCurrentPage],
	);

	const pages = children({ setCurrentPage, pageFailed });
	useHandlePageState(currentPage, setCurrentPage, pages);

	const [touchOffset, setTouchOffsetState] = useState<number | null>(null);

	const isOpen = currentPage !== "main";

	return (
		<>
			<div
				className={`pageManager ${
					isOpen ? "show" : "hide"
				} ${isHidden ? "hidden" : ""} ${touchOffset === null ? "" : "disableTransition"}`}
				style={
					touchOffset
						? {
								left: `${touchOffset && touchOffset > 0 ? touchOffset : 0}px`,
							}
						: {}
				}
				onTransitionEnd={(event) => {
					if (
						!isOpen &&
						event.propertyName === "left" &&
						event.target === pageManagerRef.current
					) {
						setIsHiddenState(true);
					}
				}}
				ref={useMultipleRef(
					useTouch({
						onMove: useCallback<OnTouchMoveType>(({ totalMove }) => {
							setTouchOffsetState(totalMove.x);
						}, []),
						onEnd: useCallback<OnTouchEndType>(
							({ currentTouches, speed }) => {
								if (currentTouches.size === 0) {
									setTouchOffsetState(null);
									if (
										(touchOffset && touchOffset > fullScreenWidth / 2) ||
										speed.x > fullScreenWidth / 900
									) {
										pageFailed();
									}
								}
							},
							[touchOffset, pageFailed],
						),
						minX: { positive: fullScreenWidth / 60 },
					}),
					useWindowEvent(
						"scroll",
						useCallback(() => {
							const obj = {
								visual: window.visualViewport?.height,
								actual: window.outerHeight,
							};

							if ((obj.visual ?? Infinity) > obj.actual / 2) {
								window.scrollTo({ top: 0, behavior: "instant" });
							}
						}, []),
					),
					pageManagerRef,
				)}
			>
				{currentOverlayPage ? pages[currentOverlayPage].node : null}
			</div>
			{pages.main.node}
		</>
	);
}

function useHandlePageState<Page extends string>(
	currentPage: Page,
	setCurrentPageState: (page: Page | "main") => void,
	pages: PagePropsRet<Page>,
) {
	useEffect(() => {
		const checkPath = () => {
			const path = window.location.pathname;
			let validKey: undefined | Extract<Page, string>;
			for (const pageKey in pages) {
				if (pageKey === "main") {
					continue;
				}
				if (
					pages[pageKey].checkValidity &&
					pages[pageKey].checkValidity(path).valid
				) {
					validKey = pageKey;
					break;
				}
			}

			if (validKey) {
				if (currentPage !== validKey) {
					setCurrentPageState(validKey);
				}
			} else {
				if (currentPage !== "main") {
					setCurrentPageState("main");
				}
			}
		};

		checkPath();

		window.addEventListener("popstate", checkPath);

		return () => {
			window.removeEventListener("popstate", checkPath);
		};
	}, [currentPage, pages, setCurrentPageState]);
}
