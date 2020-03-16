let messageCounter = 1000;

const ORIGIN = (() => {
    var b = window.location.href.split("/");
    return [b[0], b[1], b[2]].join("/");
})();

const TYPE_FILE = 'F';
const TYPE_DIR = 'D';

export interface BuildErrors {
    file: string;
    line: number;
    code: string;
    error: string;
}

export interface FrameSendMessage {
    messageID?: number;
    action?: string;
    filename?: string;
    contents?: string;
    binary?: any[];
    errors?: any[];
    dir?: string;
}

export interface FrameReplyMessage {
    messageID: number;
    binary?: any;
    errors?: any[];
    listing?: string;
    contents?: string;
    stdout?: string[];
    files?: FileListItem[];
}

export interface GetFileListRequest {
    dir: string;
    files: any[];
}

export interface GetFileListResponse {
    displayName?: string;
    name?: string;
    type?: string;
    fullPath?: string;
    files?: any[];
    isSuccess?: boolean;
};

export interface FileListItem {
    displayName: string;
    fullPath: string;
    type: string;
}


const sendMessageAwaitReply = (destwindow: Window, message: FrameSendMessage) => {
    const currentMessageCounter = messageCounter;
    messageCounter += 1;

    return new Promise<FrameReplyMessage>((resolve, reject) => {
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

export default {
    ORIGIN,
    sendMessageAwaitReply,
    waitForPong,
    sendPong,
    TYPE_DIR,
    TYPE_FILE,
}