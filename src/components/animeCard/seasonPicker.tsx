import AnimeSeason from "../../models/animeSeason";
import Select from "../generic/select";
import "./seasonPicker.css";

const SeasonPicker = ({
  animeTitle,
  seasons,
  selectedSeason,
  watched,
  onSelect,
}: {
  animeTitle: string;
  seasons: AnimeSeason[];
  selectedSeason: AnimeSeason;
  watched: boolean;
  onSelect: (seasonNumber: number) => undefined;
}) => {
  if (seasons.length <= 1) {
    return null;
  }

  return (
    <div className="seasonPickerContainer">
      <Select
        defaultValue={selectedSeason.seasonNumber}
        className={`seasonPicker ${watched ? "watched" : ""}`}
        margin={0}
        onChange={(value) => {
          onSelect(value);
        }}
        optionSelectedClass="seasonOptionSelected"
      >
        {seasons.map((season) => (
          <option
            key={`${animeTitle}${season.seasonNumber}`}
            value={season.seasonNumber}
            className={`seasonOption ${season.watched ? "watched" : ""}`}
          >
            {season.title}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default SeasonPicker;
