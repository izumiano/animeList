import { Box } from "@mui/material";
import type Anime from "../../models/anime";
import Dropdown from "../generic/dropdown";
import Image from "../generic/image";
import TextField from "../generic/form/textField";
import { useEffect, useRef, useState } from "react";
import { externalLinkId } from "../../models/externalLink";
import type AnimeSeason from "../../models/animeSeason";
import { sleepFor } from "../../utils/utils";

export default function DetailsPoster({
	anime,
	selectedSeason,
}: {
	anime: Anime;
	selectedSeason: AnimeSeason | undefined;
}) {
	const [imageLink, setImageLinkState] = useState(anime.imageLink);
	const updateImageLinkAbortController = useRef(new AbortController());

	useEffect(() => {
		setImageLinkState(anime.imageLink);
	}, [anime]);

	const imageLinkInputRef = useRef<HTMLInputElement>(null);

	const seasonUniqueId = externalLinkId(
		selectedSeason?.externalLink,
		anime.title + (selectedSeason?.title ?? ""),
	);

	const updateImageLink = async ({
		url,
		immediate,
	}: {
		url: string;
		immediate?: boolean;
	}) => {
		anime.imageLink = url;

		updateImageLinkAbortController.current.abort();
		updateImageLinkAbortController.current = new AbortController();
		if (
			!immediate &&
			(await sleepFor(1000, updateImageLinkAbortController.current.signal))
				.wasAborted
		) {
			return;
		}
		setImageLinkState(url);
	};

	return (
		<Dropdown
			dropdownButton={
				<Image src={imageLink} alt="show poster" className="animeImage" />
			}
			buttonClass="reset"
			onOpenChange={async (isOpen) => {
				if (isOpen) {
					imageLinkInputRef.current?.select();
					await sleepFor(100);
					imageLinkInputRef.current?.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				} else {
					const url = imageLinkInputRef.current?.value;
					url && updateImageLink({ url, immediate: true });
					imageLinkInputRef.current?.blur();
				}
			}}
		>
			{({ closeDropdown }) => (
				<Box
					component="form"
					onSubmit={(e) => {
						e.preventDefault();
						imageLinkInputRef.current?.blur();
						closeDropdown();
					}}
					className="imageEdit"
				>
					<TextField
						fullWidth
						id={seasonUniqueId}
						label="Image URL"
						defaultValue={anime.imageLink ?? ""}
						onChange={(url) => updateImageLink({ url })}
						inputRef={imageLinkInputRef}
						margin="normal"
					/>
				</Box>
			)}
		</Dropdown>
	);
}
