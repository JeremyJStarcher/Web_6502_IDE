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