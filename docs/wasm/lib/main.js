import common from "./common.js";
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

const goButton = document.querySelector(".js-go-button");
const assembleButton = document.querySelector(".js-compile-button");
const pauseButton = document.querySelector(".js-pause-button");
const resetButton = document.querySelector(".js-reset-button");
const flickerButton = document.querySelector(".js-flicker-button");
const runButton = document.querySelector(".js-run-button");
const stepButton = document.querySelector(".js-step-button");
const showCodeButton = document.querySelector(".js-show-code");
const showGraphicsButton = document.querySelector(".js-show-graphics");
const graphicsOutPanel = document.querySelector(".graphics-out");
const ctx = graphicsOutPanel.getContext("2d");
const editorContainer = document.querySelector(".container");
const filePickerContainer = document.querySelector(".filelist-container");
const loadFileButton = document.querySelector(".js-load-file-button");
const assembleOutput = document.querySelector("#assemble-output");
const editorButton = document.querySelector(".js-editor-button");
const menuButton = document.querySelector(".js-show-menu");

const DISPLAY_UNCHANGED = -1;
const DISPLAY_EDITOR = 1;
const DISPLAY_GRAPHICS = 2;
let newGraphicsMode = DISPLAY_UNCHANGED;

graphicsOutPanel.height = GRAPHICS_HEIGHT * PIXEL_HEIGHT;
graphicsOutPanel.width = GRAPHICS_WIDTH * PIXEL_WIDTH;

const DASM_IFRAME_ID = "dasm-iframe";

const editorFlags = {
	canAssemble: true,
	canRun: false,
	displayMode: DISPLAY_EDITOR,
};

let biosBin = []; // precompile the binary and copy it as needed
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

const writeScreenAddress = (address, value) => {
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
	newGraphicsMode == DISPLAY_GRAPHICS;
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


const toHex = (num, places) => {
	if (num === undefined) {
		return '$' + "-------------".slice(places);
	}

	let s = num.toString(16);
	while (s.length < places) {
		s = '0' + s;
	}
	return '$' + s.toUpperCase();
}

const copyBinaryToRam = (stream /* Uint8Array */) => {
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

const create6502 = (lineMappings) => {
	const step6502 = Module.cwrap('js_step6502', 'null', ['number', 'number']);
	let doBreak = false;

	const cpu_status_data = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

	// Get data byte size, allocate memory on Emscripten heap, and get pointer
	const nDataBytes = cpu_status_data.length * cpu_status_data.BYTES_PER_ELEMENT;
	let dataPtr = Module._malloc(nDataBytes);

	let dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
	Module.ccall('reset6502', null, []);

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

			if (newGraphicsMode !== DISPLAY_GRAPHICS) {
				newGraphicsMode = DISPLAY_UNCHANGED;
				showGraphicsButton.click();
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
		Module.ccall('reset6502', null, []);
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
		dataHeap.set(new Uint8Array(cpu_status_data.buffer));
		const oldpc = m6502pc;

		step6502(dataHeap.byteOffset, cpu_status_data.length);
		const result = new Uint16Array(dataHeap.buffer, dataHeap.byteOffset, cpu_status_data.length);

		[
			m6502pc, m6502sp, m6502_rega, m6502_regx, m6502_regy,
			m6502_status_bits, m6502_opcode, m6502_operand1,
			m6502_operand2, m6502_magicValue, m6502_last_bus_address,
			m6502_last_bus_value, m6502_last_bus_mode,
			m6502_instruction_ticks
		] = result;

		const v = read6502(0x0602);

		const s = `:v:${toHex(v, 2)}:: oldpc:${toHex(oldpc, 4)} -> pc:${toHex(m6502pc, 4)} addr:${toHex(m6502_last_bus_address)}: value:${toHex(m6502_last_bus_value, 2)} op:${toHex(m6502_opcode, 2)}`;
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

		document.querySelector("#w6502-pc").innerHTML = toHex(m6502pc, 4);
		document.querySelector("#w6502-rega").innerHTML = toHex(m6502_rega, 2);
		document.querySelector("#w6502-regx").innerHTML = toHex(m6502_regx, 2);
		document.querySelector("#w6502-regy").innerHTML = toHex(m6502_regy, 2);
		document.querySelector("#w6502-opcode").innerHTML = toHex(m6502_opcode, 2);
		document.querySelector("#w6502-byte1").innerHTML = toHex(m6502_operand1, 2);
		document.querySelector("#w6502-byte2").innerHTML = toHex(m6502_operand2, 2);
		document.querySelector("#w6502-sp").innerHTML = toHex(m6502sp, 2);
		document.querySelector("#w6502-flags").innerHTML = ("0000000000" + m6502_status_bits.toString(2)).slice(-8);
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
		oldiframe.parentNode.removeChild(oldiframe);
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

	return dasmIframe.contentWindow;
};

const assemble = async (cw, filename, src) => {
	route.gotoSection("wait");

	const sendmessagereply = await common.sendMessageAwaitReply(cw, {
		action: 'writeFile',
		filename: `${filename}.asm`,
		contents: src,
	});

	await common.sendMessageAwaitReply(cw, {
		action: 'unlinkFile',
		filename: `${filename}.bin`,
	});

	const assembleResult = await common.sendMessageAwaitReply(cw, {
		action: 'runAssembler',
		filename: `${filename}`,
	});

	// For some reason -- the binary value is coming back
	// as an object and keys, not an array.  it doesn't even
	// have a 'length' property, so we'll calculate the length
	// out by hand and then turn it into a real array.

	const keys = Object.keys(assembleResult.binary);
	const max = Math.max(...keys);
	assembleResult.binary.length = max + 1;
	assembleResult.binary = Array.from(assembleResult.binary);

	copyBinaryToRam(biosBin);
	copyBinaryToRam(assembleResult.binary);

	const errorLines = assembleResult.errors.map(e => e.line);
	editor.setErrors(errorLines);

	assembleOutput.innerHTML = assembleResult.errors.map(l => {
		return `<a href="#"
                 data-error-message="${l.error}"
                 data-line="${l.line}"
                 data-file="${l.file}">
                 Error: Line ${l.line}: ${l.error}
               </a>`;
	}).join("<br>");

	fillScreen();

	route.gotoSection("editor");

	return assembleResult;
};

const wireButtons = () => {
	let lineMappings;
	let m6502;

	const runAssemble = async (filename, src) => {
		const cw = await loadDasmIFrame();
		const assembleResult = await assemble(cw, filename, src);
		destroydasmIframe();

		// console.log(assembleResult.listing);
		lineMappings = buildLineMappings(assembleResult.listing);

		if (m6502) {
			m6502.destroy();
		}

		m6502 = create6502(lineMappings);
		editorFlags.canRun = !assembleResult.errors.length;
		updateButtons();
	};

	goButton.addEventListener("click", async () => {
		Module.ccall('reset6502', null, []);
		await runAssemble("/file", editor.getValue());
		m6502.run();
	});

	assembleButton.addEventListener("click", () => {
		Module.ccall('reset6502', null, []);
		runAssemble("/file", editor.getValue());
	});

	runButton.addEventListener("click", () => {
		m6502.run();
	});

	flickerButton.addEventListener("click", () => {
		m6502.flicker();
	});

	resetButton.addEventListener("click", () => {
		m6502.reset();
	});

	pauseButton.addEventListener("click", () => {
		m6502.pause();
	});

	stepButton.addEventListener("click", () => {
		m6502.singleStep();
	});

	showCodeButton.addEventListener("click", () => {
		editorFlags.displayMode = DISPLAY_EDITOR;
		updateButtons();
	});

	showGraphicsButton.addEventListener("click", () => {
		editorFlags.displayMode = DISPLAY_GRAPHICS;
		updateButtons();
	});

	document.addEventListener("keypress", (e) => {
		if (e.type === "keypress") {
			const value = e.which;
			write6502(0x00FF, value);
		}
	}, true);

	document.addEventListener("click", (e) => {
		const t = event.target;
		if (t.dataset.errorMessage) {
			editor.jumpToLine(+t.dataset.line);
		}
	});

	const speedlist = document.querySelector(".speedlist");
	while (speedlist.firstChild) {
		speedlist.remove(speedlist.firstChild);
	};

	CPU_SPEEDS.forEach((d, i, a) => {
		const checked = d.speed === CPS ? "checked" : "";
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
		input.value = d.speed;
		input.checked = checked;

		label.addEventListener("click", (e) => {
			const inp = e.currentTarget.querySelector("input");
			inp.checked = true;
			currentCps = inp.value;
		});

		span.appendChild(document.createTextNode(d.words));
	});
};

const buildLineMappings = (listing) => {
	let map = [];

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
	const editorPanel = document.querySelector(".CodeMirror");

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
		case DISPLAY_EDITOR:
			editorPanel.style.display = null;
			break;
		case DISPLAY_GRAPHICS:
			graphicsOutPanel.style.display = null;
			break;
	}
};

const onCodeChange = () => {
	editorFlags.canAssemble = true;
	editorFlags.canRun = false;
	updateButtons();
};

const buildBios = async (cw) => {
	const workFile = "/tmp_bios";

	const filereadResult = await common.sendMessageAwaitReply(cw, {
		action: 'readTextFile',
		filename: `/asm/bios.asm`,
	});

	const src = filereadResult.contents;

	await common.sendMessageAwaitReply(cw, {
		action: 'writeFile',
		filename: `${workFile}.asm`,
		contents: src,
	});

	const assembleResults = await assemble(cw, workFile, src);
	biosBin = assembleResults.binary;
};

window.main_init = async () => {
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
	const con = document.querySelector(".editor-panel");
	const canvas = document.querySelector(".graphics-out");

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
	editorFlags.displayMode = DISPLAY_GRAPHICS;
	updateButtons();

	resizeCanvas();

	editorFlags.displayMode = DISPLAY_EDITOR;
	updateButtons();
};
