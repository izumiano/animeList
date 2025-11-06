import MALCardFactory from "./malCardFactory";
import BadResponse from "../responses/badResponse";
import type {
	ExternalLink,
	MALExternalLink,
	TMDBExternalLink,
} from "../../models/externalLink";
import TMDBCardFactory from "./tmdbCardFactory";
import type { Require } from "../../utils/utils";

export default class AnimeCardFactory {
	public static create({
		externalLink,
		order,
		getSequels,
	}: {
		order: number;
	} & (
		| { getSequels: true; externalLink: ExternalLink }
		| ({ getSequels: false } & {
				externalLink:
					| MALExternalLink
					| (Omit<TMDBExternalLink, "mediaType"> & { mediaType: "movie" })
					| Require<TMDBExternalLink, "seasonId">;
		  })
	)) {
		switch (externalLink?.type) {
			case "MAL":
				return MALCardFactory.create({
					id: externalLink.id,
					order: order,
					getSequels: getSequels,
				});
			case "TMDB":
				return TMDBCardFactory.create({
					externalLink: externalLink,
					order: order,
					getSequels: getSequels,
				});
			default:
				return new BadResponse(
					`Cannot construct new anime, invalid external link type ${externalLink?.type}`,
				);
		}
	}
}
