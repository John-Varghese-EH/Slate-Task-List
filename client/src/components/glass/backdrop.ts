let backdropSupport: boolean | undefined;

export function supportsBackdropRefraction() {
	if (backdropSupport !== undefined) return backdropSupport;
	if (typeof navigator === "undefined" || typeof CSS === "undefined") {
		return false;
	}
	const brands = (
		navigator as Navigator & {
			userAgentData?: { brands?: Array<{ brand: string }> };
		}
	).userAgentData?.brands;
	backdropSupport =
		Boolean(brands?.some(({ brand }) => brand === "Chromium")) &&
		CSS.supports("backdrop-filter", "url(#glass)");
	return backdropSupport;
}

const ROOT_KEYFRAMES = [
	"opacity",
	"filter",
	"backdropFilter",
	"clipPath",
	"mask",
	"maskImage",
];

// check nearest backdrop filter root element
export function underBackdropRoot(element: Element) {
	const top = element.ownerDocument.documentElement;
	for (
		let node = element.parentElement;
		node && node !== top;
		node = node.parentElement
	) {
		const style = getComputedStyle(node);
		if (
			Number(style.opacity) < 1 ||
			style.filter !== "none" ||
			style.backdropFilter !== "none" ||
			style.clipPath !== "none" ||
			style.maskImage !== "none" ||
			style.mixBlendMode !== "normal" ||
			/opacity|filter|mask|clip-path|mix-blend-mode/.test(style.willChange)
		) {
			return true;
		}
		for (const animation of node.getAnimations?.() ?? []) {
			const effect = animation.effect;
			if (
				effect instanceof KeyframeEffect &&
				effect
					.getKeyframes()
					.some((frame) => ROOT_KEYFRAMES.some((key) => key in frame))
			) {
				return true;
			}
		}
	}
	return false;
}
