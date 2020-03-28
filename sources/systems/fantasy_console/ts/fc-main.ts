import { scaleElement } from "./common/scale-element";

// Don't use the resize event -- sometimes the canvas and iframe
// is hidden and therefore has a size of 0.  The ResizeObserver
// doesn't have universal support.
const r = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const { width, height } = (window.parent as any).GET_IFRAME_SIZE();
    scaleElement(width, height, canvas);
    setTimeout(r, 500);
};
r();


// CLOCK SPEED IN CYCLES PER SECOND
const CPS = 1000000;
let currentCps = CPS;


const CPU_SPEEDS = (() => {
	const _1MHz = 1000000;
	const percents = [0.1, 1, 10, 25, 50, 100, 147];
	return percents.map(percent => {
		const speed = _1MHz * (percent / 100);
		const words = (speed / _1MHz).toFixed(3) + " Mhz";
		return {
			speed,
			words,
		}
	});
})();
