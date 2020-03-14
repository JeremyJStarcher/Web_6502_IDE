import common from "./common.js";

const stdOut = [];

const getFileListEvent = (data, reply) => {
    const names = FS.readdir(data.dir).filter(n => n !== ".");

    const list = names.map(n => {
        const s = FS.lstat(`${data.dir}/${n}`);

        const isDir = FS.isDir(s.mode);
        const isFile = FS.isFile(s.mode);

        const type = (isDir ? common.TYPE_DIR : "") + (isFile ? common.TYPE_FILE : "");

        const blocks = type === common.TYPE_DIR ? "[]" : "";
        const displayName = blocks.charAt(0) + n.toUpperCase() + blocks.charAt(1);

        return {
            displayName,
            name: n,
            type,
            fullPath: `${data.dir}/${n}`,
        }
    });

    var dirs = list.filter(p => p.type === common.TYPE_DIR);
    var files = list.filter(p => p.type === common.TYPE_FILE);

    const sortF = (a, b) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1;

    dirs.sort(sortF);
    files.sort(sortF);
    reply.files = [...dirs, ...files];

    parent.postMessage(JSON.stringify(reply), common.ORIGIN);
};

const stdoutToError = (stdout) => {
    // bios.asm:3: error: Unknown Mnemonic 'zzz'.

    const errors = [];

    stdout.forEach(l => {
        const [file, line, code, error] = l
            .split(":")
            .map(s => s.trim())
            .map((s, i) => i === 1 ? Number(s) : s);

        if (code === "error") {
            errors.push({
                file,
                line,
                code,
                error,
            })
        }
    });
    return errors;
};

const runAssemblerEvent = (data, reply) => {
    const outputformat = 2;
    const types = ['string', 'integer'];
    const args = [data.filename, outputformat];

    const result = Module.ccall(
        'wasm_main',	// name of C function
        null,	// return type
        types,	// argument types
        args,
    );

    const listing = FS.readFile(`${data.filename}.lst`, { encoding: "utf8" });
    const bin = FS.readFile(`${data.filename}.bin`);



    reply.errors = stdoutToError(stdOut);

    reply.stdout = stdOut;
    reply.listing = listing;
    reply.binary = bin;

    parent.postMessage(JSON.stringify(reply), common.ORIGIN);
};


const unlinkFileEvent = (data, reply) => {
    FS.writeFile(data.filename, "");
    FS.unlink(data.filename);

    parent.postMessage(JSON.stringify(reply), common.ORIGIN);
};

const writeFileEvent = (data, reply) => {
    FS.writeFile(data.filename, data.contents);
    parent.postMessage(JSON.stringify(reply), common.ORIGIN);
};

const writeReadTextFileEvent = (data, reply) => {
    reply.contents = FS.readFile(data.filename, { encoding: "utf8" });
    parent.postMessage(JSON.stringify(reply), common.ORIGIN);
};

const writeReadBinaryFileEvent = (data, reply) => {
    const contents = FS.readFile(data.filename);
    reply.contents = contents;
    parent.postMessage(JSON.stringify(reply), common.ORIGIN);
};

const messageEventListener = function (e) {
    if (e.origin === common.ORIGIN) {
        const data = JSON.parse(e.data);

        const reply = {
            messageID: data.messageID,
            isSuccess: true,
        };

        switch (data.action) {
            case "writeFile":
                writeFileEvent(data, reply);
                break;
            case "readTextFile":
                writeReadTextFileEvent(data, reply);
                break;
            case "readBinaryFile":
                writeReadBinaryFileEvent(data, reply);
                break;
            case "unlinkFile":
            case "unlinkFile":
                unlinkFileEvent(data, reply);
                break;
            case "runAssembler":
                runAssemblerEvent(data, reply);
                break;
            case "getFileList":
                getFileListEvent(data, reply);
                break;
        }
    }
}

window.addEventListener('message', messageEventListener, false);

window.dasm_main = () => {
    common.sendPong(parent);
};

// Note:
//   The version of dasm used here logs error messages to stdout
//   not stderror.
window.dasm_log_stdout = (msg) => {
    stdOut.push(msg);
};