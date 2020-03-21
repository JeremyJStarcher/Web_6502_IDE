declare const FS: any;

import { ORIGIN } from "./host-origin";

let messageCounter = 1000;

const TYPE_FILE = 'F';
const TYPE_DIR = 'D';

export interface FileListItem {
    displayName: string;
    fullPath: string;
    type: string;
}

const sendMessage = <T extends BaseSendMessageRequest, U>(destwindow: Window, message: T) => {
    const currentMessageCounter = messageCounter;
    messageCounter += 1;

    return new Promise<U>((resolve, reject) => {
        const replyListener = function replyListener(e: MessageEvent) {
            if (e.origin === ORIGIN) {
                const data = JSON.parse(e.data);

                if (data.messageID === currentMessageCounter) {
                    window.removeEventListener('message', replyListener, false);
                    resolve(data);
                }
            }
        }

        window.addEventListener('message', replyListener, false);
        message.messageID = currentMessageCounter;
        destwindow.postMessage(JSON.stringify(message), ORIGIN);
    });
};


const waitForPong = () => {
    return new Promise((resolve, reject) => {
        const replyListener = function replyListener(e: MessageEvent) {
            if (e.origin === ORIGIN) {
                const data = JSON.parse(e.data);

                if (data.action === "PONG") {
                    window.removeEventListener('message', replyListener, false);
                    resolve(data);
                }
            }
        }

        window.addEventListener('message', replyListener, false);
    });
};

const sendPong = (destwindow: Window) => {
    const message = {
        action: "PONG",
    }
    destwindow.postMessage(JSON.stringify(message), ORIGIN);
};

const getFileListEvent = (data: GetFileListRequest) => {
    const names = FS.readdir(data.dir).filter((n: string) => n !== ".");

    const list: DirectoryList[] = names.map((n: string) => {
        const s = FS.lstat(`${data.dir}/${n}`);

        const isDir = FS.isDir(s.mode);
        const isFile = FS.isFile(s.mode);

        const type = (isDir ? TYPE_DIR : "") + (isFile ? TYPE_FILE : "");

        const blocks = type === TYPE_DIR ? "[]" : "";
        const displayName = blocks.charAt(0) + n.toUpperCase() + blocks.charAt(1);
        const r: DirectoryList = {
            displayName,
            name: n,
            type,
            fullPath: `${data.dir}/${n}`,

        };

        return r;
    });

    var dirs = list.filter((p) => p.type === TYPE_DIR);
    var files = list.filter((p) => p.type === TYPE_FILE);

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

    parent.postMessage(JSON.stringify(response), ORIGIN);
};

const unlinkFileEvent = (request: UnlinkFileRequest) => {
    FS.writeFile(request.filename, "");
    FS.unlink(request.filename);

    const response: UnlinkFileResponse = {
        messageID: request.messageID,
    };

    parent.postMessage(JSON.stringify(response), ORIGIN);
};

const writeFileEvent = (request: WriteTextFileRequest) => {
    FS.writeFile(request.filename, request.contents);
    const response: WriteTextFileResponse = {
        messageID: request.messageID,
    };
    parent.postMessage(JSON.stringify(response), ORIGIN);
};

const readTextFileEvent = (request: ReadTextFileRequest) => {
    const response: ReadTextFileResponse = {
        isSuccess: true,
        contents: FS.readFile(request.filename, { encoding: "utf8" }),
        messageID: request.messageID,
    }
    parent.postMessage(JSON.stringify(response), ORIGIN);
};

const readBinaryFileEvent = (request: ReadBinaryFileRequest) => {
    const response: ReadBinaryFileResponse = {
        isSuccess: true,
        contents: FS.readFile(request.filename),
        messageID: request.messageID,
    }
    parent.postMessage(JSON.stringify(response), ORIGIN);
};

const assertNever = (x: never): never => {
    // Don't panic.
    // throw new Error(`Unexpected object: ${x}`);
    return null as never;
}

const ioEventListener = function (e: MessageEvent) {
    if (e.origin === ORIGIN) {
        const request = JSON.parse(e.data) as IOEvent;

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
            case "getFileList":
                getFileListEvent(request);
                break;
            default:
                assertNever(request);
        }
    }
}

window.addEventListener('message', ioEventListener, false);

export default {
    sendMessage,
    waitForPong,
    sendPong,
    TYPE_DIR,
    TYPE_FILE,
}