import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { parseError } from "./utils/utils";

export default function RouteErrorPage() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		const message =
			typeof error.data === "string" ? error.data : error.data?.message;

		return (
			<div>
				<h1>Oops!</h1>
				<h2>
					{error.status} {error.statusText}
				</h2>
				{message && <p>{message}</p>}
			</div>
		);
	}

	return (
		<div
			className="flexRow fullHeight verticalCenterItems scroll"
			style={{ flexWrap: "wrap" }}
		>
			<div className="fullWidth flexGrow">
				<h1>Something Went Wrong!</h1>
				{parseError(error, { showDetails: true, handleScroll: false })}
			</div>
		</div>
	);
}
