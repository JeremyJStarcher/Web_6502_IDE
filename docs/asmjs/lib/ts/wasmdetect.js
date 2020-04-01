"use strict";
(() => {
    var _a, _b;
    const isWasmSupported = (() => {
        try {
            if (typeof WebAssembly === "object"
                && typeof WebAssembly.instantiate === "function") {
                const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
                if (module instanceof WebAssembly.Module)
                    return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
            }
        }
        catch (e) {
        }
        return false;
    })();
    const wasmDirectHome = document.querySelector(".js-wasm-redirect");
    if (wasmDirectHome) {
        wasmDirectHome.innerHTML = `
			<div class="button-row">
				<button id="runwasm">WASM Version (Faster)</button>
				<button id="runasm">JavaScript version (More compatible)</button>
			</div>

			<div id="wasm-no" style="display: none">
				<p>
					Your browser does not support WASM. This could be because the browser
					is out of date or because security features do not allow WASM to run.
				</p>

				<p>Have no fear. The JavaScript version has the same interface
					and the same features. It might be a bit slower, however.
				</p>


			</div>
`;
        if (!isWasmSupported) {
            const e1 = document.querySelector("#runwasm");
            if (e1) {
                e1.disabled = true;
            }
            const e2 = document.querySelector("#wasm-no");
            if (e2) {
                e2.style.display = "";
            }
        }
        (_a = document.querySelector("#runwasm")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            window.location = "wasm/";
        });
        (_b = document.querySelector("#runasm")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            window.location = "asmjs/";
        });
    }
    const wasmFlag = window.WASM_FLAG;
    const list = Array.from(document.querySelectorAll(".js-wasm-mode"));
    list.forEach(el => {
        const text = wasmFlag ? "WASM" : "ASM.js";
        el.innerHTML = `[Current mode: ${text}]`;
    });
    const warning = document.querySelector(".js-error-no-wasm");
    if (!isWasmSupported && wasmFlag) {
        if (warning) {
            warning.style.display = "";
        }
    }
    const warningIcon = document.querySelector(".error-icon");
    if (warningIcon) {
        warningIcon.innerHTML = `...._....
.../.\\...
../.|.\\..
./..|..\\.
/___o___\\`.replace(/\./g, "&nbsp;");
    }
    ;
})();
//# sourceMappingURL=wasmdetect.js.map