declare const FS: any;
declare const Module: any;

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

window.addEventListener('message', (e: MessageEvent) => {
	const m = JSON.parse(e.data) as SendRomMessage;
	const boot_machine = Module.cwrap('boot_machine', null, ['void']);

	if (m.action === "send-rom") {
		const bin = Uint8Array.from(JSON.parse(m.json));
		FS.writeFile("/file.rom", bin);
		boot_machine();
		console.log(`Glory! Received new ROM of ${bin.length}`);
	}
}, false);

window.addEventListener("keydown", (e: KeyboardEvent) => {
	const write6502 = Module.cwrap('write6502', 'void', ['number', 'number']);
	const ascii = e.key.charCodeAt(0)
	console.log(ascii, e.key, e.keyCode);
	write6502(0xFF, ascii);
});