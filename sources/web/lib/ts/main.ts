declare const Module: any;

 import common from "./common";

//import common from "common.js";
import route from "./route.js";
import { editor } from "./editor.js";
import { fileList } from "./filelist.js";

const PIXEL_HEIGHT = 15;
const PIXEL_WIDTH = 15;
const GRAPHICS_HEIGHT = 32;
const GRAPHICS_WIDTH = 32;

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

const palette = [
	"#000000", "#ffffff", "#880000", "#aaffee",
	"#cc44cc", "#00cc55", "#0000aa", "#eeee77",
	"#dd8855", "#664400", "#ff7777", "#333333",
	"#777777", "#aaff66", "#0088ff", "#bbbbbb"
];

const goButton = document.querySelector(".js-go-button") as HTMLButtonElement;
const assembleButton = document.querySelector(".js-compile-button") as HTMLButtonElement;
const pauseButton = document.querySelector(".js-pause-button") as HTMLButtonElement;
const resetButton = document.querySelector(".js-reset-button") as HTMLButtonElement;
const flickerButton = document.querySelector(".js-flicker-button") as HTMLButtonElement;
const runButton = document.querySelector(".js-run-button") as HTMLButtonElement;
const stepButton = document.querySelector(".js-step-button") as HTMLButtonElement;
const showCodeButton = document.querySelector(".js-show-code") as HTMLButtonElement;
const showGraphicsButton = document.querySelector(".js-show-graphics") as HTMLButtonElement;
const graphicsOutPanel = document.querySelector(".graphics-out") as HTMLCanvasElement;
const ctx = graphicsOutPanel!.getContext("2d") as CanvasRenderingContext2D;
const editorContainer = document.querySelector(".container");
const filePickerContainer = document.querySelector(".filelist-container");
const loadFileButton = document.querySelector(".js-load-file-button") as HTMLButtonElement;
const assembleOutput = document.querySelector("#assemble-output") as HTMLDivElement;
const editorButton = document.querySelector(".js-editor-button") as HTMLButtonElement;
const menuButton = document.querySelector(".js-show-menu") as HTMLButtonElement;

enum DISPLAY_MODE {
	UNCHANGED = -1,
	EDITOR = 1,
	GRAPHICS = 2,
};

let newGraphicsMode = DISPLAY_MODE.UNCHANGED;

graphicsOutPanel.height = GRAPHICS_HEIGHT * PIXEL_HEIGHT;
graphicsOutPanel.width = GRAPHICS_WIDTH * PIXEL_WIDTH;

const DASM_IFRAME_ID = "dasm-iframe";

const editorFlags = {
	canAssemble: true,
	canRun: false,
	displayMode: DISPLAY_MODE.EDITOR,
};

let biosBin = [] as number[]; // precompile the binary and copy it as needed
const trace = [];

let [m6502pc,
	m6502sp,
	m6502_rega,
	m6502_regx,
	m6502_regy,
	m6502_status_bits,
	m6502_opcode,
	m6502_operand1,
	m6502_operand2,
	m6502_magicValue,
	m6502_last_bus_address,
	m6502_last_bus_value, m6502_last_bus_mode,
	m6502_instruction_ticks
] = Array(13);

const write6502 = Module.cwrap('write6502', 'void', ['number']);
const read6502 = Module.cwrap('read6502', 'number', ['void']);
const reset6502 = Module.cwrap('reset6502', null, ['void']);

let rand = (minInclusive: number, maxInclusive: number) =>
	minInclusive + (maxInclusive - minInclusive + 1)
	* crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32 | 0

const writeScreenAddress = (address: number, value: number) => {
	if (address < 0x200 || address > 0x05FF) {
		return;
	}

	address -= 0x0200;

	var w = Math.floor(address % GRAPHICS_WIDTH);
	var h = Math.floor(address / GRAPHICS_WIDTH);
	const color = palette[value & 0x0F];

	ctx.fillStyle = color;
	ctx.strokeStyle = color;

	ctx.fillRect(w * PIXEL_WIDTH, h * PIXEL_HEIGHT, PIXEL_WIDTH, PIXEL_HEIGHT);
	newGraphicsMode == DISPLAY_MODE.GRAPHICS;
}

const fillScreen = () => {
	for (let h = 0; h < GRAPHICS_HEIGHT; h++) {
		for (let w = 0; w < GRAPHICS_WIDTH; w++) {
			const address = 0x200 + ((h * GRAPHICS_HEIGHT) + w);
			const val = read6502(address);
			writeScreenAddress(address, val);
		}
	}
};

const clearScreen = () => {
	for (let h = 0; h < GRAPHICS_HEIGHT; h++) {
		for (let w = 0; w < GRAPHICS_WIDTH; w++) {
			const address = 0x200 + ((h * GRAPHICS_HEIGHT) + w);
			write6502(address, 0);
			writeScreenAddress(address, 0);
		}
	}
};


const toHex = (num: number, places: number) => {
	if (num === undefined) {
		return '$' + "-------------".slice(places);
	}

	let s = num.toString(16);
	while (s.length < places) {
		s = '0' + s;
	}
	return '$' + s.toUpperCase();
}

const copyBinaryToRam = (stream: Uint8Array | number[]) => {
	// The stream format we choose for this project has the following format:
	// Chunk format, may be repeated multiple times
	// Address:  <LSB> <MSB>
	// Length:   <LSB <MSB>
	// Data:     <BYTE>....

	let i = 0;
	while (i < stream.length) {
		const address = (stream[i + 1] * 256) + stream[i];
		i += 2
		const len = (stream[i + 1] * 256) + stream[i];
		i += 2;

		for (let j = 0; j < len; j++) {
			const offset = address + j;
			const b = stream[i];
			write6502(offset, b);
			i += 1;
		}
	}
}

interface MOS6502 {
	destroy: () => void;
	singleStep: () => void;
	run: () => void;
	flicker: () => void;
	reset: () => void;
	pause: () => void;
}

const create6502 = (lineMappings: LineMappings[]) => {
	const step6502 = Module.cwrap('js_step6502', 'null', ['number', 'number']);
	let doBreak = false;

	const cpu_status_data = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

	// Get data byte size, allocate memory on Emscripten heap, and get pointer
	const nDataBytes = cpu_status_data.length * cpu_status_data.BYTES_PER_ELEMENT;
	let dataPtr = Module._malloc(nDataBytes);

	let dataHeap: Uint8Array | null = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
	reset6502();

	const destroy = () => {
		if (dataHeap) {
			// Free memory
			Module._free(dataHeap.byteOffset);
			dataHeap = null;
		}
	};

	const singleStep = () => {
		executeInstruction();
		showStatus();
	}

	const processResults = () => {
		if (m6502_magicValue === 0xFF && m6502pc < 0xFFF0) {
			doBreak = true;
		}
		if (doBreak) {
			// console.log(trace);
		}
	}

	const run = () => {
		doBreak = false;
		function t() {
			const startTime = window.performance.now();
			let ticks = 0;
			const timeChunks = 2;

			while (true) {
				executeInstruction();
				processResults();
				ticks += m6502_instruction_ticks;
				if (ticks > currentCps / timeChunks) {
					break;
				}
				if (doBreak) {
					break;
				}
			}

			if (newGraphicsMode !== DISPLAY_MODE.GRAPHICS) {
				newGraphicsMode = DISPLAY_MODE.UNCHANGED;
				showGraphicsButton!.click();
			}

			if (!doBreak) {
				const wallTime = window.performance.now() - startTime;
				const timeDiff = 1000 / timeChunks / wallTime;
				setTimeout(t, timeDiff);
			}
		}
		t();
	};

	const reset = () => {
		clearScreen();
		reset6502();
		doBreak = true;
	};

	const pause = () => {
		doBreak = true;
	};


	const flicker = function t() {
		executeInstruction();
		processResults();
		showStatus();
		if (!doBreak) {
			requestAnimationFrame(t);
		}
	};

	const executeInstruction = () => {
		write6502(0xFE, rand(0, 255));
		dataHeap!.set(new Uint8Array(cpu_status_data.buffer));
		const oldpc = m6502pc;

		step6502(dataHeap!.byteOffset, cpu_status_data.length);
		const result = new Uint16Array(dataHeap!.buffer, dataHeap!.byteOffset, cpu_status_data.length);

		[
			m6502pc, m6502sp, m6502_rega, m6502_regx, m6502_regy,
			m6502_status_bits, m6502_opcode, m6502_operand1,
			m6502_operand2, m6502_magicValue, m6502_last_bus_address,
			m6502_last_bus_value, m6502_last_bus_mode,
			m6502_instruction_ticks
		] = result;

		const v = read6502(0x0602);

		const s = `:v:${toHex(v, 2)}:: oldpc:${toHex(oldpc, 4)} -> pc:${toHex(m6502pc, 4)} addr:${toHex(m6502_last_bus_address, 4)}: value:${toHex(m6502_last_bus_value, 2)} op:${toHex(m6502_opcode, 2)}`;
		trace.unshift(s);
		trace.length = 40;

		if (m6502_last_bus_mode === 1) {
			writeScreenAddress(m6502_last_bus_address, m6502_last_bus_value);
		}
	}

	const showStatus = () => {
		let details = lineMappings[m6502pc];
		if (details) {
			editor.setLineMarker(details.line);
		}

		document.querySelector("#w6502-pc")!.innerHTML = toHex(m6502pc, 4);
		document.querySelector("#w6502-rega")!.innerHTML = toHex(m6502_rega, 2);
		document.querySelector("#w6502-regx")!.innerHTML = toHex(m6502_regx, 2);
		document.querySelector("#w6502-regy")!.innerHTML = toHex(m6502_regy, 2);
		document.querySelector("#w6502-opcode")!.innerHTML = toHex(m6502_opcode, 2);
		document.querySelector("#w6502-byte1")!.innerHTML = toHex(m6502_operand1, 2);
		document.querySelector("#w6502-byte2")!.innerHTML = toHex(m6502_operand2, 2);
		document.querySelector("#w6502-sp")!.innerHTML = toHex(m6502sp, 2);
		document.querySelector("#w6502-flags")!.innerHTML = ("0000000000" + m6502_status_bits.toString(2)).slice(-8);
	};


	return {
		destroy,
		singleStep,
		run,
		flicker,
		reset,
		pause,
	};
};

const destroydasmIframe = async () => {
	const oldiframe = document.getElementById(DASM_IFRAME_ID);
	if (oldiframe) {
		oldiframe.parentNode!.removeChild(oldiframe);
	}
}

const loadDasmIFrame = async () => {
	await destroydasmIframe();

	const dasmIframe = document.createElement("iframe");
	dasmIframe.id = DASM_IFRAME_ID;
	dasmIframe.src = "dasm.html";
	dasmIframe.style.display = "none";

	document.body.appendChild(dasmIframe);

	await common.waitForPong();

	return dasmIframe.contentWindow!;
};

const assemble = async (
	cw: any,
	filename: string,
	src: string) => {
	route.gotoSection("wait");

	const sendmessagereply = await common.sendMessage<WriteTextFileRequest, WriteTextFileResponse>(cw, {
		messageID: 0,
		action: 'writeFile',
		filename: `${filename}.asm`,
		contents: src,
	});

	await common.sendMessage<UnlinkFileRequest, UnlinkFileResponse>(cw, {
		messageID: 0,
		action: 'unlinkFile',
		filename: `${filename}.bin`,
	});

	const assembleResult = await common.sendMessage<RunAssemblerRequest, RunAssemblerResponse>(cw, {
		messageID: 0,
		action: 'runAssembler',
		filename: `${filename}`,
	});

	// For some reason -- the binary value is coming back
	// as an object and keys, not an array.  it doesn't even
	// have a 'length' property, so we'll calculate the length
	// out by hand and then turn it into a real array.

	copyBinaryToRam(biosBin);
	copyBinaryToRam(assembleResult.binary);

	if (assembleResult.errors) {
		const errorLines = assembleResult.errors.map(e => e.line);
		editor.setErrors(errorLines);

		assembleOutput!.innerHTML = assembleResult.errors.map(l => {
			return `<a href="#"
                 data-error-message="${l.error}"
                 data-line="${l.line}"
                 data-file="${l.file}">
                 Error: Line ${l.line}: ${l.error}
               </a>`;
		}).join("<br>");

		editorFlags.canRun = !assembleResult.errors.length;
	}

	fillScreen();

	route.gotoSection("editor");

	return assembleResult;
};

const wireButtons = () => {
	let lineMappings;
	let m6502: MOS6502;

	const runAssemble = async (filename: string, src: string) => {
		const cw = await loadDasmIFrame();
		const assembleResult = await assemble(cw, filename, src);
		destroydasmIframe();

		// console.log(assembleResult.listing);
		lineMappings = buildLineMappings(assembleResult?.listing || "--");

		if (m6502) {
			m6502.destroy();
		}

		m6502 = create6502(lineMappings);
		updateButtons();
	};

	goButton!.addEventListener("click", async () => {
		reset6502();
		await runAssemble("/file", editor.getValue());
		m6502.run();
	});

	assembleButton!.addEventListener("click", () => {
		reset6502();
		runAssemble("/file", editor.getValue());
	});

	runButton!.addEventListener("click", () => {
		m6502.run();
	});

	flickerButton!.addEventListener("click", () => {
		m6502.flicker();
	});

	resetButton!.addEventListener("click", () => {
		m6502.reset();
	});

	pauseButton!.addEventListener("click", () => {
		m6502.pause();
	});

	stepButton!.addEventListener("click", () => {
		m6502.singleStep();
	});

	showCodeButton!.addEventListener("click", () => {
		editorFlags.displayMode = DISPLAY_MODE.EDITOR;
		updateButtons();
	});

	showGraphicsButton.addEventListener("click", () => {
		editorFlags.displayMode = DISPLAY_MODE.GRAPHICS;
		updateButtons();
	});

	document.addEventListener("keypress", (e) => {
		if (e.type === "keypress") {
			const value = e.which;
			write6502(0x00FF, value);
		}
	}, true);

	document.addEventListener("click", (e) => {
		const t = event!.target as HTMLElement
		if (t && t.dataset!.errorMessage) {
			const val = t.dataset.line as string;
			editor.jumpToLine(+val);
		}
	});

	const speedlist = document.querySelector(".speedlist") as HTMLElement;
	while (speedlist.firstChild) {
		speedlist.removeChild(speedlist.firstChild);
	};

	CPU_SPEEDS.forEach((d, i, a) => {
		const checked = d.speed === CPS;
		const div = document.createElement("div");
		const label = document.createElement("label");
		const input = document.createElement("input");
		const span = document.createElement("span");

		div.appendChild(label);
		label.appendChild(input);
		label.appendChild(span);
		speedlist.appendChild(div);

		input.type = "radio";
		input.name = "cpuspeed";
		input.value = "" + d.speed;
		input.checked = checked;

		label.addEventListener("click", (e) => {
			const curTarget = e!.currentTarget as HTMLElement;
			const inp = curTarget!.querySelector("input") as HTMLInputElement;
			inp.checked = true;
			currentCps = +inp.value;
		});

		span.appendChild(document.createTextNode(d.words));
	});
};

interface LineMappings {
	file: string;
	line: number;
}
const buildLineMappings = (listing: string) => {
	let map: LineMappings[] = [];

	let file = "";
	let line = 0;
	let address = 0;

	listing.split(/\r\n|\r|\n/).forEach((s) => {
		const cps = s
			.replace(/\t/g, " ")
			.replace(/  /g, " ")
			.trim();

		const bits = cps.split(/ /);

		if (bits[0] === "-------" && bits[1] === "FILE") {
			file = bits[2];
			return;
		}

		if (bits[1] === undefined) {
			return;
		}

		line = parseInt(bits[0], 10);
		address = parseInt(bits[1], 16);

		const f = (line > 0)
			&& (bits[1].length === 4)
			&& (address > 0);

		if (f) {
			map[address] = {
				line,
				file,
			};
		}
	});

	return map;
	/*
	"------- FILE /file.asm LEVEL 1 PASS 1
      1  0000 ????
      2  0000 ????				      PROCESSOR	6502
      3  f000					      ORG	$F000
      4  f000
      5  f000				   Initialize subroutine		; Cleanup routine from macro.h (by Andrew Davie/DASM)
      6  f000
      7  f000							; Twiddle the bit to watch it change onscreen
      8  f000		       d8		      CLD
 ------ 4075 bytes free before End of Cartridge
"
*/
}

const updateButtons = () => {
	const editorPanel = document.querySelector(".CodeMirror") as HTMLElement;

	[goButton, assembleButton, flickerButton, runButton, stepButton]
		.forEach(b => b.disabled = true);

	[editorPanel, graphicsOutPanel].forEach(p => p.style.display = "none");

	if (editorFlags.canAssemble) {
		assembleButton.disabled = false;
		goButton.disabled = false;
	}

	if (editorFlags.canRun) {
		[flickerButton, runButton, stepButton]
			.forEach(b => b.disabled = false);
	}

	switch (editorFlags.displayMode) {
		case DISPLAY_MODE.EDITOR:
			editorPanel.style.display = "";
			break;
		case DISPLAY_MODE.GRAPHICS:
			graphicsOutPanel.style.display = "";
			break;
	}
};

const onCodeChange = () => {
	editorFlags.canAssemble = true;
	editorFlags.canRun = false;
	updateButtons();
};

const buildBios = async (cw: Window) => {
	const workFile = "/tmp_bios";

	const filereadResult = await common.sendMessage<ReadTextFileRequest, ReadTextFileResponse>(cw, {
		messageID: 0,
		action: 'readTextFile',
		filename: `/asm/bios.asm`,
	});

	const src = filereadResult.contents;

	await common.sendMessage<WriteTextFileRequest, WriteTextFileResponse>(cw, {
		messageID: 0,
		action: 'writeFile',
		filename: `${workFile}.asm`,
		contents: src,
	});

	const assembleResults = await assemble(cw, workFile, src ?? "--");
	biosBin = assembleResults.binary;
};

(window as any).main_init = async () => {
	const cw = await loadDasmIFrame();
	editor.init(onCodeChange);
	editor.setValue("; Placeholder\n; Placeholder");

	wireButtons();
	setCanvasAutoScale();

	await buildBios(cw);
	route.onload();
	editorButton.addEventListener("click", async () => {
		route.gotoSection("editor");
	});

	menuButton.addEventListener("click", async () => {
		route.gotoSection("main");
	});


	loadFileButton.addEventListener("click", async () => {
		route.gotoSection("filelist");

		const cw = await loadDasmIFrame();

		fileList.pickFile(cw, "/asm/examples", (file) => {
			route.gotoSection("editor");

			editor.setValue(file.contents);
			destroydasmIframe();
		});
	});
};

function resizeCanvas() {
	const con = document.querySelector(".editor-panel") as HTMLElement;
	const canvas = document.querySelector(".graphics-out") as HTMLCanvasElement;

	// Go back to full size
	canvas.style.transform = `translate(0px, 0px) scale(1)`;

	const minDimension = Math.min(con.offsetWidth, con.offsetHeight);

	const newScale = minDimension / canvas.offsetWidth;
	const newHeight = canvas.offsetHeight * newScale;

	const offset = (canvas.offsetHeight - newHeight) / 2;
	canvas.style.transform = `translate(${-offset}px, ${-offset}px) scale(${newScale})`;
}

const setCanvasAutoScale = () => {
	window.addEventListener("resize", resizeCanvas);
	editorFlags.displayMode = DISPLAY_MODE.GRAPHICS;
	updateButtons();

	resizeCanvas();

	editorFlags.displayMode = DISPLAY_MODE.EDITOR;
	updateButtons();
};
