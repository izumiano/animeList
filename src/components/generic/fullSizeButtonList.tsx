import type { ReactNode } from "react";
import "./fullSizeButtonList.css";

export function FullSizeButtonList({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div className={`fullSizeButtonList flexColumn ${className}`}>
			{children}
		</div>
	);
}
