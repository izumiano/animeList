import AnimeSeason from "../../models/animeSeason";
import "./seasonPicker.css";

const SeasonPicker = ({
  animeTitle,
  seasons,
  selectedSeasonWatched,
  onSelect,
}: {
  animeTitle: string;
  seasons: AnimeSeason[];
  selectedSeasonWatched: boolean;
  onSelect: (seasonNumber: number) => undefined;
}) => {
  if (seasons.length <= 1) {
    return null;
  }

  return (
    <div className="seasonPickerContainer">
      <select
        className={`seasonPicker ${selectedSeasonWatched ? "watched" : ""}`}
        name="seasons"
        id={`${animeTitle}seasons`}
        onChange={(event) => {
          onSelect(parseInt(event.target.value));
        }}
      >
        {seasons.map((season) => (
          <option
            key={`${animeTitle}${season.seasonNumber}`}
            value={season.seasonNumber}
          >
            {season.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonPicker;
