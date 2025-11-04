import MALCardFactory from "./malCardFactory";
import BadResponse from "../responses/badResponse";
import type { ExternalLink } from "../../models/externalLink";
import TMDBCardFactory from "./tmdbCardFactory";

export default class AnimeCardFactory {
	public static create({
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
