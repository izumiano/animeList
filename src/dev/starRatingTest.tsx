import StarRating from "../components/generic/starRating";

export default function StarRatingTest() {
	return (
		<>
			<StarRating starCount={10} />
			<StarRating starCount={5} />
			<StarRating starCount={3} />
		</>
	);
}
