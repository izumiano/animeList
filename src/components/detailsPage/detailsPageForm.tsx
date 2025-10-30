import { Grid } from "@mui/material";
import TextField from "../generic/form/textField";
import type Anime from "../../models/anime";
import type AnimeSeason from "../../models/animeSeason";
import { dialogifyKey } from "../../utils/utils";
import FormSelect from "../generic/form/formSelect";
import { MediaTypeValues, type MediaType } from "../../models/anime";
import { externalLinkId } from "../../models/externalLink";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DatePicker from "../generic/form/datePicker";
import { useEffect } from "react";

const DetailsPageForm = ({
	anime,
	season,
}: {
	anime: Anime;
	season: AnimeSeason | undefined;
}) => {
	const animeId = externalLinkId(anime.externalLink, anime.title);
	const seasonId = season
		? externalLinkId(season.externalLink, season.title)
		: null;

	useEffect(() => {
		console.log("now");
	}, [anime.watched, season?.watched]);

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Grid
				container
				color={"white"}
				spacing={2}
				sx={{ padding: "0 3rem 3rem 3rem" }}
			>
				<Grid size={12}>
					<h2 className="leftAlignedText smallMargin">-Anime Details-</h2>
				</Grid>
				<Grid size={6}>
					<TextField
						fullWidth
						id={animeId}
						label="Title"
						defaultValue={anime.title}
						onChange={(value) => {
							anime.title = value;
						}}
					/>
				</Grid>
				<Grid size={6} />
				<Grid size={6}>
					<DatePicker
						id={animeId}
						label="Date Started"
						defaultValue={anime.dateStarted}
						onChange={(value) => (anime.dateStarted = value)}
					/>
				</Grid>
				<Grid size={6}>
					<DatePicker
						id={animeId}
						label="Date Finished"
						defaultValue={anime.dateFinished}
						onChange={(value) => (anime.dateFinished = value)}
					/>
				</Grid>

				{season ? (
					<>
						<Grid size={12}>
							<h2 className="leftAlignedText smallMargin">-Season Details-</h2>
						</Grid>
						<Grid size={6}>
							<TextField
								fullWidth
								id={seasonId!}
								label="Title"
								defaultValue={season.title}
								onChange={(value) => {
									season.title = value;
								}}
							/>
						</Grid>
						<Grid size={6}>
							<FormSelect<MediaType>
								id={seasonId!}
								label="Media Type"
								defaultValue={season.mediaType}
								onChange={(value) => (season.mediaType = value)}
							>
								{MediaTypeValues.map((mediaType) => ({
									value: mediaType,
									children: dialogifyKey(mediaType),
								}))}
							</FormSelect>
						</Grid>
						<Grid size={6}>
							<DatePicker
								id={seasonId!}
								label="Date Started"
								defaultValue={season.dateStarted}
								onChange={(value) => (season.dateStarted = value)}
							/>
						</Grid>
						<Grid size={6}>
							<DatePicker
								id={seasonId!}
								label="Date Finished"
								defaultValue={season.dateFinished}
								onChange={(value) => (season.dateFinished = value)}
							/>
						</Grid>
					</>
				) : null}
			</Grid>
		</LocalizationProvider>
	);
};

export default DetailsPageForm;
