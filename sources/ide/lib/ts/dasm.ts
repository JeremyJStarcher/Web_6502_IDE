import fileXfer from "./common/file-xfer";
import { ORIGIN } from "./common/host-origin";

declare const Module: any;
const stdOut: string[] = [];
declare const FS: any;

const stdoutToError = (stdout: string[]) => {
    // bios.asm:3: error: Unknown Mnemonic 'zzz'.

    const errors: BuildErrors[] = [];

    stdout.forEach(l => {
        const [file, line, code, error] = l
            .split(":")
            .map(s => s.trim());

        if (code === "error") {
            const err: BuildErrors = {
                file,
                line: +line,
                code,
                error,
            };

            errors.push(err);
        }
    });
    return errors;
};

const runAssemblerEvent = (request: RunAssemblerRequest) => {
    const outputformat = 2;

    const zargs = [
        `${request.filename}.asm`,
        `-o${request.filename}.bin`,
        `-l${request.filename}.lst`,
        `-s${request.filename}.sym`,
        `-E2`,
        `-f${outputformat}`,
    ];

    Module.callMain(zargs);

    const listing = FS.readFile(`${request.filename}.lst`, { encoding: "utf8" });
    const typedBin = FS.readFile(`${request.filename}.bin`);

    // Convert a typed array to a normal JS array.
    // Typed arrays don't survive the transport process.
    const bin = Array.from(typedBin) as number[];

    const response: RunAssemblerResponse = {
        errors: stdoutToError(stdOut),
        stdout: stdOut,
        listing: listing,
        binary: bin,
        messageID: request.messageID,
    };

    parent.postMessage(JSON.stringify(response), ORIGIN);
};

const assertNever = (x: never): never => {
    // Don't panic.
    // throw new Error(`Unexpected object: ${x}`);
    return null as never;
}

const buildEventListener = function (e: MessageEvent) {
    if (e.origin === ORIGIN) {
        const request = JSON.parse(e.data) as BuildEvent;

        switch (request.action) {
            case "runAssembler":
                runAssemblerEvent(request);
                break;
            case "runAssembler2":
                // runAssemblerEvent(request);
                break;
            default:
                assertNever(request);
        }
    }
}


window.addEventListener('message', buildEventListener, false);

(window as any).dasm_main = () => {
    fileXfer.sendPong(parent);
};

// Note:
//   The version of dasm used here logs error messages to stdout
//   not stderror.
(window as any).dasm_log_stdout = (msg: string) => {
    stdOut.push(msg);
};