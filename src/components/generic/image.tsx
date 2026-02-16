import missingImage from "assets/missingImage.png";

const Image = ({
	src,
	alt,
	className,
	width,
	height,
}: {
	src: string | null | undefined;
	alt: string | undefined;
	className?: string;
	width?: number;
	height?: number;
}) => {
	if (src === "") {
		src = null;
	}

	return (
		<img
			src={src ?? missingImage}
			alt={alt}
			className={className}
			width={width}
			height={height}
			style={{
				backgroundImage: `url('${missingImage}')`,
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		></img>
	);
};

export default Image;
