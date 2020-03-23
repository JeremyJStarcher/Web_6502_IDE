export const scaleElement = (conWidth: number, conHeight: number, canvas: HTMLElement) => {
	// Go back to full size
	canvas.style.transform = `translate(0px, 0px) scale(1)`;

	const minDimension = Math.min(conWidth, conHeight);

	const newScale = minDimension / canvas.offsetWidth;
	const newHeight = canvas.offsetHeight * newScale;
	const newWidth = canvas.offsetWidth * newScale;

	const offsetWidth = (canvas.offsetWidth - newWidth) / 2;
    const offsetHeight = (canvas.offsetHeight - newHeight) / 2;

	canvas.style.transform = `translate(${-offsetWidth}px, ${-offsetHeight}px) scale(${newScale})`;
}
