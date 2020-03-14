(() => {
    const isWasmSupported = (() => {
        try {
            if (typeof WebAssembly === "object"
                && typeof WebAssembly.instantiate === "function") {
                const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
                if (module instanceof WebAssembly.Module)
                    return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
            }
        } catch (e) {
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
            document.querySelector("#runwasm").disabled = true;
            document.querySelector("#wasm-no").display = "";
        }

        document.querySelector("#runwasm").addEventListener("click", () => {
            window.location = "/wasm";
        });


        document.querySelector("#runasm").addEventListener("click", () => {
            window.location = "/asmjs";
        });
    }

    const list = Array.from(document.querySelectorAll(".js-wasm-mode"));
    list.forEach(el => {
        const text = window.WASM_FLAG ? "WASM" : "ASM.js";
        el.innerHTML = `[Current mode: ${text}]`;
    });

    const warning = document.querySelector(".js-error-no-wasm");
    if (!isWasmSupported && window.WASM_FLAG) {
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
    };

})();
