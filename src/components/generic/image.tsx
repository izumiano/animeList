import missingImage from "assets/missingImage.png";

const Image = ({
	src,
	alt,
	className,
	minWidth,
	maxWidth,
	minHeight,
	maxHeight,
}: {
	src: string | null | undefined;
	alt: string;
	className?: string;
	minWidth?: string | number;
	maxWidth?: string | number;
	minHeight?: string | number;
	maxHeight?: string | number;
}) => {
	if (src === "") {
		src = null;
	}

	return (
		<img
			src={src ?? missingImage}
			alt={alt}
			className={className}
			style={{
				backgroundImage: `url('${missingImage}') no-repeat`,
				minWidth: minWidth,
				maxWidth: maxWidth,
				minHeight: minHeight,
				maxHeight: maxHeight,
			}}
		></img>
	);
};

export default Image;
