import fileXfer from "./common/file-xfer";

import route from "./route.js";
import { editor } from "./editor.js";
import { fileList } from "./filelist.js";

const goButton = document.querySelector(".js-go-button") as HTMLButtonElement;
const assembleButton = document.querySelector(".js-compile-button") as HTMLButtonElement;
const editFileButton = document.querySelector(".js-edit-file-button") as HTMLButtonElement;
const loadFileButton = document.querySelector(".js-load-file-button") as HTMLButtonElement;
const assembleOutput = document.querySelector("#assemble-output") as HTMLDivElement;
const menuButton = document.querySelector(".js-show-menu") as HTMLButtonElement;

const DASM_IFRAME_ID = "dasm-iframe";

const editorFlags = {
	canAssemble: true,
	canRun: false,
};


let rand = (minInclusive: number, maxInclusive: number) =>
	minInclusive + (maxInclusive - minInclusive + 1)
	* crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32 | 0


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

	await fileXfer.waitForPong();

	return dasmIframe.contentWindow!;
};

const assemble = async (
	cw: any,
	filename: string,
	src: string) => {
	route.gotoSection("wait");

	const sendmessagereply = await fileXfer.sendMessage<WriteTextFileRequest, WriteTextFileResponse>(cw, {
		messageID: 0,
		action: 'writeFile',
		filename: `${filename}.asm`,
		contents: src,
	});

	await fileXfer.sendMessage<UnlinkFileRequest, UnlinkFileResponse>(cw, {
		messageID: 0,
		action: 'unlinkFile',
		filename: `${filename}.bin`,
	});

	const assembleResult = await fileXfer.sendMessage<RunAssemblerRequest, RunAssemblerResponse>(cw, {
		messageID: 0,
		action: 'runAssembler',
		filename: `${filename}`,
	});

	// TODO: Send the binary to the console

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

	route.gotoSection("editor");

	return assembleResult;
};

const wireButtons = () => {
	let lineMappings;

	const runAssemble = async (filename: string, src: string) => {
		const cw = await loadDasmIFrame();
		const assembleResult = await assemble(cw, filename, src);
		destroydasmIframe();

		// console.log(assembleResult.listing);
		lineMappings = buildLineMappings(assembleResult?.listing || "--");

		updateButtons();
	};

	goButton!.addEventListener("click", async () => {
		await runAssemble("/file", editor.getValue());
	});

	assembleButton!.addEventListener("click", () => {
		runAssemble("/file", editor.getValue());
	});

	editFileButton!.addEventListener("click", () => {
		route.gotoSection("editor");
	});

	document.addEventListener("click", (e) => {
		const t = event!.target as HTMLElement
		if (t && t.dataset!.errorMessage) {
			const val = t.dataset.line as string;
			editor.jumpToLine(+val);
		}
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

	editorPanel.style.display = "";

	if (editorFlags.canAssemble) {
		assembleButton.disabled = false;
		goButton.disabled = false;
	}
};

const onCodeChange = () => {
	editorFlags.canAssemble = true;
	editorFlags.canRun = false;
	updateButtons();
};

(window as any).main_init = async () => {
	editor.init(onCodeChange);
	editor.setValue("; Placeholder\n; Placeholder");

	wireButtons();

	route.onload();

	menuButton.addEventListener("click", async () => {
		route.gotoSection("main");
	});

	loadFileButton.addEventListener("click", async () => {
		route.gotoSection("filelist");
		const cw = await loadDasmIFrame();

		fileList.pickFile(cw, "/examples", async (file) => {
			route.gotoSection("editor");
			editor.setValue(file.contents);
			destroydasmIframe();
		});
	});
};
