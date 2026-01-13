import statsIcon from "assets/statsIcon.png";
import type { Page } from "../../Home";

export default function StatsButton({
	setCurrentPageState,
}: {
	setCurrentPageState: (page: Page) => void;
}) {
	return (
		<button
			type="button"
			className="menuBarButton"
			onClick={() => {
				history.pushState(null, "", `/stats`);
				setCurrentPageState("stats");
			}}
		>
			<img src={statsIcon} alt="stats icon" width={25} />
		</button>
	);
}
