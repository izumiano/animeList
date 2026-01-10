import filterIcon from "assets/filter.png";

const AnimeFilterButton = () => {
	return (
		<button type="button" className="menuBarButton">
			<img src={filterIcon} alt="Filter options"></img>
		</button>
	);
};

export default AnimeFilterButton;
