export default function CrossIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={2}
			stroke="currentColor"
			height="24"
			width="24"
			{...props}
		>
			<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
		</svg>
	);
}
