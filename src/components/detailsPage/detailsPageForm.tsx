import { Grid } from "@mui/material";
import TextField from "../generic/form/textField";
import type Anime from "../../models/anime";
import type AnimeSeason from "../../models/animeSeason";
import { formatDate as baseFormatDate, dialogifyKey } from "../../utils/utils";
import FormSelect from "../generic/form/formSelect";
import { MediaTypeValues, type MediaType } from "../../models/anime";
import { externalLinkId } from "../../models/externalLink";

function formatDate(date: Date | null | undefined) {
	return baseFormatDate(date, "d mmm yyyy", "");
}

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

	return (
		<Grid container color={"white"} spacing={2} sx={{ margin: "1rem 3rem" }}>
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
				<TextField
					fullWidth
					id={animeId}
					label="Date Started"
					defaultValue={formatDate(anime.dateStarted)}
					onChange={(value) => {
						console.log(value);
					}}
				/>
			</Grid>
			<Grid size={6}>
				<TextField
					fullWidth
					id={animeId}
					label="Date Finished"
					defaultValue={formatDate(anime.dateFinished)}
					onChange={(value) => {
						console.log(value);
					}}
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
						<TextField
							fullWidth
							id={seasonId!}
							label="Date Started"
							defaultValue={formatDate(season.dateStarted)}
							onChange={(value) => {
								console.log(value);
							}}
						/>
					</Grid>
					<Grid size={6}>
						<TextField
							fullWidth
							id={seasonId!}
							label="Date Finished"
							defaultValue={formatDate(season.dateFinished)}
							onChange={(value) => {
								console.log(value);
							}}
						/>
					</Grid>
				</>
			) : null}
		</Grid>
	);
};

export default DetailsPageForm;
