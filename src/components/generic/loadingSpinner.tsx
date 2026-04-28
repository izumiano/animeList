import "./loadingSpinner.css";

const LoadingSpinner = ({
	props,
	className,
}: {
	props?: {
		centered?: boolean;
		size?: string;
		absolutePos?: boolean;
	};
	className?: string;
}) => (
	<div
		className={`loadingSpinnerContainer ${props?.centered ? "centered" : ""} ${className}`}
	>
		<div
			className={`loadingSpinner ${props?.absolutePos ? "absolute" : ""}`}
			style={{ width: props?.size ?? "50px", height: props?.size ?? "50px" }}
		></div>
	</div>
);

export default LoadingSpinner;
