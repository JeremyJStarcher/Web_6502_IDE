let messageCounter = 1000;

const ORIGIN = (() => {
    var b = window.location.href.split("/");
    return [b[0], b[1], b[2]].join("/");
})();

const TYPE_FILE = 'F';
const TYPE_DIR = 'D';

const sendMessageAwaitReply = (destwindow, message) => {
    const currentMessageCounter = messageCounter;
    messageCounter += 1;

    return new Promise((resolve, reject) => {
        const replyListener = function replyListener(e) {
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
        const replyListener = function replyListener(e) {
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

const sendPong = (destwindow) => {
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