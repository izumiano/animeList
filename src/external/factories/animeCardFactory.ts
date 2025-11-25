import type { ExternalLink } from "../../models/externalLink";
import BadResponse from "../responses/badResponse";
import MALCardFactory from "./malCardFactory";
import TMDBCardFactory from "./tmdbCardFactory";

const AnimeCardFactory = {
	create({
		externalLink,
		order,
		getSequels,
	}: {
		externalLink: ExternalLink;
		order: number;
		getSequels: boolean;
	}) {
		switch (externalLink?.type) {
			case "MAL":
				return MALCardFactory.create({
					id: externalLink.id,
					order: order,
					getSequels: getSequels,
				});
			case "TMDB":
				switch (externalLink.mediaType) {
					case "tv":
						if (getSequels) {
							return TMDBCardFactory.create({
								externalLink: externalLink,
								order: order,
								getSequels: true,
							});
						} else {
							if (externalLink.seasonId == null) {
								return new BadResponse(
									"Missing season id in getCreateAnimeTask",
								);
							}
							return TMDBCardFactory.create({
								externalLink: {
									...externalLink,
									type: "TMDB",
									mediaType: "tv",
									seasonId: externalLink.seasonId,
								},
								order: order,
								getSequels: getSequels,
							});
						}
					case "movie":
						return TMDBCardFactory.create({
							externalLink: {
								...externalLink,
								type: "TMDB",
								mediaType: "movie",
							},
							order: order,
							getSequels: getSequels,
						});
					default:
						return new BadResponse(
							`Cannot construct new anime, invalid media type ${externalLink.mediaType}`,
						);
				}
			default:
				return new BadResponse(
					`Cannot construct new anime, invalid external link type ${externalLink?.type}`,
				);
		}
	},
};

export default AnimeCardFactory;
