import common from "./common.js";

declare const Module: any;
const stdOut: string[] = [];
declare const FS: any;

const getFileListEvent = (data: GetFileListRequest) => {
    const names = FS.readdir(data.dir).filter((n: string) => n !== ".");

    const list: DirectoryList[] = names.map((n: string) => {
        const s = FS.lstat(`${data.dir}/${n}`);

        const isDir = FS.isDir(s.mode);
        const isFile = FS.isFile(s.mode);

        const type = (isDir ? common.TYPE_DIR : "") + (isFile ? common.TYPE_FILE : "");

        const blocks = type === common.TYPE_DIR ? "[]" : "";
        const displayName = blocks.charAt(0) + n.toUpperCase() + blocks.charAt(1);
        const r: DirectoryList = {
            displayName,
            name: n,
            type,
            fullPath: `${data.dir}/${n}`,

        };

        return r;
    });

    var dirs = list.filter((p) => p.type === common.TYPE_DIR);
    var files = list.filter((p) => p.type === common.TYPE_FILE);

    interface FileSortValue {
        name: string;
    }

    const sortF = (a: FileSortValue, b: FileSortValue) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1;

    dirs.sort(sortF);
    files.sort(sortF);

    const response: GetFileListResponse = {
        isSuccess: true,
        files: [...dirs, ...files],
        messageID: data.messageID,
    };

    parent.postMessage(JSON.stringify(response), common.ORIGIN);
};

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
    const types = ['string', 'integer'];
    const args = [request.filename, outputformat];

    const result = Module.ccall(
        'wasm_main',	// name of C function
        null,	// return type
        types,	// argument types
        args,
    );

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

    parent.postMessage(JSON.stringify(response), common.ORIGIN);
};


const unlinkFileEvent = (request: UnlinkFileRequest) => {
    FS.writeFile(request.filename, "");
    FS.unlink(request.filename);

    const response: UnlinkFileResponse = {
        messageID: request.messageID,
    };

    parent.postMessage(JSON.stringify(response), common.ORIGIN);
};

const writeFileEvent = (request: WriteTextFileRequest) => {
    FS.writeFile(request.filename, request.contents);
    const response: WriteTextFileResponse = {
        messageID: request.messageID,
    };
    parent.postMessage(JSON.stringify(response), common.ORIGIN);
};

const readTextFileEvent = (request: ReadTextFileRequest) => {
    const response: ReadTextFileResponse = {
        isSuccess: true,
        contents: FS.readFile(request.filename, { encoding: "utf8" }),
        messageID: request.messageID,
    }
    parent.postMessage(JSON.stringify(response), common.ORIGIN);
};

const readBinaryFileEvent = (request: ReadBinaryFileRequest) => {
    const response: ReadBinaryFileResponse = {
        isSuccess: true,
        contents: FS.readFile(request.filename),
        messageID: request.messageID,
    }
    parent.postMessage(JSON.stringify(response), common.ORIGIN);
};


const assertNever = (x: never): never => {
    throw new Error(`Unexpected object: ${x}`);
}

const messageEventListener = function (e: MessageEvent) {
    if (e.origin === common.ORIGIN) {
        const request = JSON.parse(e.data) as SendMessageType;

        switch (request.action) {
            case "writeFile":
                writeFileEvent(request);
                break;
            case "readTextFile":
                readTextFileEvent(request);
                break;
            case "readBinaryFile":
                readBinaryFileEvent(request);
                break;
            case "unlinkFile":
                unlinkFileEvent(request);
                break;
            case "runAssembler":
                runAssemblerEvent(request);
                break;
            case "getFileList":
                getFileListEvent(request);
                break;
            default:
                assertNever(request);
        }
    }
}

window.addEventListener('message', messageEventListener, false);

(window as any).dasm_main = () => {
    common.sendPong(parent);
};

// Note:
//   The version of dasm used here logs error messages to stdout
//   not stderror.
(window as any).dasm_log_stdout = (msg: string) => {
    stdOut.push(msg);
};