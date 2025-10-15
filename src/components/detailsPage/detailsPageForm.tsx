import { Grid } from "@mui/material";
import TextField from "../generic/TextField";
import type Anime from "../../models/anime";
import type AnimeSeason from "../../models/animeSeason";
import { formatDate as baseFormatDate } from "../../utils/utils";

function formatDate(date: Date | null | undefined) {
	return baseFormatDate(date, "d mmm yyyy", "");
}

const DetailsPageForm = ({
	anime,
	season,
}: {
	anime: Anime;
	season: AnimeSeason;
}) => {
	return (
		<Grid container color={"white"} spacing={2} sx={{ margin: "1rem 3rem" }}>
			<Grid size={12}>
				<h2 className="leftAlignedText smallMargin">-Anime Details-</h2>
			</Grid>
			<Grid size={6}>
				<TextField
					fullWidth
					label="Title"
					defaultValue={anime.title}
					onChange={(event) => {
						const title = event.target.value;
						anime.title = title;
					}}
				/>
			</Grid>
			<Grid size={6} />
			<Grid size={6}>
				<TextField
					fullWidth
					label="Date Started"
					defaultValue={formatDate(anime.dateStarted)}
					onChange={(event) => {
						console.log(event.target.value);
					}}
				/>
			</Grid>
			<Grid size={6}>
				<TextField
					fullWidth
					label="Date Finished"
					defaultValue={formatDate(anime.dateFinished)}
					onChange={(event) => {
						console.log(event.target.value);
					}}
				/>
			</Grid>

			<Grid size={12}>
				<h2 className="leftAlignedText smallMargin">-Season Details-</h2>
			</Grid>
			<Grid size={6}>
				<TextField
					fullWidth
					label="Title"
					defaultValue={season.title}
					onChange={(event) => {
						const title = event.target.value;
						season.title = title;
					}}
				/>
			</Grid>
			<Grid size={6}>
				<TextField
					fullWidth
					label="Media Type"
					defaultValue={season.mediaType}
					onChange={(event) => {
						console.log(event.target.value);
					}}
				/>
			</Grid>
			<Grid size={6}>
				<TextField
					fullWidth
					label="Date Started"
					defaultValue={formatDate(season.dateStarted)}
					onChange={(event) => {
						console.log(event.target.value);
					}}
				/>
			</Grid>
			<Grid size={6}>
				<TextField
					fullWidth
					label="Date Finished"
					defaultValue={formatDate(season.dateFinished)}
					onChange={(event) => {
						console.log(event.target.value);
					}}
				/>
			</Grid>
		</Grid>
	);
};

export default DetailsPageForm;
