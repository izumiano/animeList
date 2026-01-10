import plusIcon from "assets/plus.png";
import "./addAnimeButton.css";

const AddAnimeButton = ({
	setIsOpenState,
	className,
}: {
	setIsOpenState: (isOpen: boolean) => void;
	className: string;
}) => {
	return (
		<button
			type="button"
			className={className}
			onClick={() => {
				setIsOpenState(true);
			}}
		>
			<img src={plusIcon} alt="open add new show panel"></img>
		</button>
	);
};

export default AddAnimeButton;
