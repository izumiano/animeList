import type AnimeSeason from "../../models/animeSeason";
import "./seasonPicker.css";

const SeasonPicker = ({
  animeTitle,
  seasons,
  selectedSeasonIndex,
  onSelect,
}: {
  animeTitle: string;
  seasons: AnimeSeason[];
  selectedSeasonIndex: number;
  onSelect: (seasonNumber: number) => undefined;
}) => {
  if (seasons.length <= 1) {
    return null;
  }

  const color = seasons[selectedSeasonIndex].watched
    ? "var(--colSecondaryTrans)"
    : "var(--colAccent)";

  return (
    <div className="seasonPickerContainer">
      <select
        className="seasonPicker"
        name="seasons"
        id={`${animeTitle}seasons`}
        style={{ backgroundColor: color }}
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
