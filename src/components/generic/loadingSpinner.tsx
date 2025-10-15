import "./loadingSpinner.css";

const LoadingSpinner = ({
	props,
}: {
	props?: { centered?: boolean; size?: string };
}) => (
	<div
		className={`loadingSpinnerContainer ${props?.centered ? "centered" : ""}`}
	>
		<div
			className={`loadingSpinner`}
			style={{ width: props?.size ?? "50px", height: props?.size ?? "50px" }}
		></div>
	</div>
);

export default LoadingSpinner;
