import type { ReactNode } from "react";
import "./confirmationDropdown.css";

const ConfirmationDropdown = ({
	title,
	confirmMessage,
	confirmClass,
	dismissMessage,
	dismissClass,
	closeDropdown,
	onConfirm,
}: {
	title: ReactNode;
	confirmMessage: ReactNode;
	confirmClass?: string;
	dismissMessage: ReactNode;
	dismissClass?: string;
	closeDropdown: () => void;
	onConfirm: () => void;
}) => (
	<div className="flexColumn largePadding">
		<span className="smallMargin">{title}</span>
		<div className="equalRowItems thing">
			<button
				className={`smallMargin ${confirmClass}`}
				onClick={() => {
					closeDropdown();
					onConfirm();
				}}
			>
				{confirmMessage}
			</button>
			<button className={`smallMargin ${dismissClass}`} onClick={closeDropdown}>
				{dismissMessage}
			</button>
		</div>
	</div>
);

export default ConfirmationDropdown;
