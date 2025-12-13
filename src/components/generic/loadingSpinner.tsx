import "./loadingSpinner.css";

const LoadingSpinner = ({
	props,
}: {
	props?: { centered?: boolean; size?: string; absolutePos?: boolean };
}) => (
	<div
		className={`loadingSpinnerContainer ${props?.centered ? "centered" : ""}`}
	>
		<div
			className={`loadingSpinner ${props?.absolutePos ? "absolute" : ""}`}
			style={{ width: props?.size ?? "50px", height: props?.size ?? "50px" }}
		></div>
	</div>
);

export default LoadingSpinner;
