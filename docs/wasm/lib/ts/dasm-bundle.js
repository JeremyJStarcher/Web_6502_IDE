/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var ORIGIN = (function () {
    var b = window.location.href.split("/");
    return [b[0], b[1], b[2]].join("/");
})();

var messageCounter = 1000;
var TYPE_FILE = 'F';
var TYPE_DIR = 'D';
var sendMessage = function (destwindow, message) {
    var currentMessageCounter = messageCounter;
    messageCounter += 1;
    return new Promise(function (resolve, reject) {
        var replyListener = function replyListener(e) {
            if (e.origin === ORIGIN) {
                var data = JSON.parse(e.data);
                if (data.messageID === currentMessageCounter) {
                    window.removeEventListener('message', replyListener, false);
                    resolve(data);
                }
            }
        };
        window.addEventListener('message', replyListener, false);
        message.messageID = currentMessageCounter;
        destwindow.postMessage(JSON.stringify(message), ORIGIN);
    });
};
var waitForPong = function () {
    return new Promise(function (resolve, reject) {
        var replyListener = function replyListener(e) {
            if (e.origin === ORIGIN) {
                var data = JSON.parse(e.data);
                if (data.action === "PONG") {
                    window.removeEventListener('message', replyListener, false);
                    resolve(data);
                }
            }
        };
        window.addEventListener('message', replyListener, false);
    });
};
var sendPong = function (destwindow) {
    var message = {
        action: "PONG",
    };
    destwindow.postMessage(JSON.stringify(message), ORIGIN);
};
var getFileListEvent = function (data) {
    var names = FS.readdir(data.dir).filter(function (n) { return n !== "."; });
    var list = names.map(function (n) {
        var s = FS.lstat(data.dir + "/" + n);
        var isDir = FS.isDir(s.mode);
        var isFile = FS.isFile(s.mode);
        var type = (isDir ? TYPE_DIR : "") + (isFile ? TYPE_FILE : "");
        var blocks = type === TYPE_DIR ? "[]" : "";
        var displayName = blocks.charAt(0) + n.toUpperCase() + blocks.charAt(1);
        var r = {
            displayName: displayName,
            name: n,
            type: type,
            fullPath: data.dir + "/" + n,
        };
        return r;
    });
    var dirs = list.filter(function (p) { return p.type === TYPE_DIR; });
    var files = list.filter(function (p) { return p.type === TYPE_FILE; });
    var sortF = function (a, b) { return (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1; };
    dirs.sort(sortF);
    files.sort(sortF);
    var response = {
        isSuccess: true,
        files: __spreadArrays(dirs, files),
        messageID: data.messageID,
    };
    parent.postMessage(JSON.stringify(response), ORIGIN);
};
var unlinkFileEvent = function (request) {
    FS.writeFile(request.filename, "");
    FS.unlink(request.filename);
    var response = {
        messageID: request.messageID,
    };
    parent.postMessage(JSON.stringify(response), ORIGIN);
};
var writeTextFile = function (request) {
    FS.writeFile(request.filename, request.contents);
    var response = {
        messageID: request.messageID,
    };
    parent.postMessage(JSON.stringify(response), ORIGIN);
};
var writeBinaryFile = function (request) {
    FS.writeFile(request.filename, request.contents);
    var response = {
        messageID: request.messageID,
    };
    parent.postMessage(JSON.stringify(response), ORIGIN);
};
var readTextFileEvent = function (request) {
    var response = {
        isSuccess: true,
        contents: FS.readFile(request.filename, { encoding: "utf8" }),
        messageID: request.messageID,
    };
    parent.postMessage(JSON.stringify(response), ORIGIN);
};
var readBinaryFileEvent = function (request) {
    var response = {
        isSuccess: true,
        contents: FS.readFile(request.filename),
        messageID: request.messageID,
    };
    parent.postMessage(JSON.stringify(response), ORIGIN);
};
var ioEventListener = function (e) {
    if (e.origin === ORIGIN) {
        var request = JSON.parse(e.data);
        switch (request.action) {
            case "writeTextFile":
                writeTextFile(request);
                break;
            case "writeBinaryFile":
                writeBinaryFile(request);
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
        }
    }
};
window.addEventListener('message', ioEventListener, false);
var fileXfer = {
    sendMessage: sendMessage,
    waitForPong: waitForPong,
    sendPong: sendPong,
    TYPE_DIR: TYPE_DIR,
    TYPE_FILE: TYPE_FILE,
};

var stdOut = [];
var stdoutToError = function (stdout) {
    // bios.asm:3: error: Unknown Mnemonic 'zzz'.
    var errors = [];
    stdout.forEach(function (l) {
        var _a = l
            .split(":")
            .map(function (s) { return s.trim(); }), file = _a[0], line = _a[1], code = _a[2], error = _a[3];
        if (code === "error") {
            var err = {
                file: file,
                line: +line,
                code: code,
                error: error,
            };
            errors.push(err);
        }
    });
    return errors;
};
var runAssemblerEvent = function (request) {
    var outputformat = 2;
    var zargs = [
        request.filename + ".asm",
        "-o" + request.filename + ".bin",
        "-l" + request.filename + ".lst",
        "-s" + request.filename + ".sym",
        "-E2",
        "-f" + outputformat,
    ];
    Module.callMain(zargs);
    var listing = FS.readFile(request.filename + ".lst", { encoding: "utf8" });
    var typedBin = FS.readFile(request.filename + ".bin");
    // Convert a typed array to a normal JS array.
    // Typed arrays don't survive the transport process.
    var bin = Array.from(typedBin);
    var response = {
        errors: stdoutToError(stdOut),
        stdout: stdOut,
        listing: listing,
        binary: bin,
        messageID: request.messageID,
    };
    parent.postMessage(JSON.stringify(response), ORIGIN);
};
var buildEventListener = function (e) {
    if (e.origin === ORIGIN) {
        var request = JSON.parse(e.data);
        switch (request.action) {
            case "runAssembler":
                runAssemblerEvent(request);
                break;
        }
    }
};
window.addEventListener('message', buildEventListener, false);
window.dasm_main = function () {
    fileXfer.sendPong(parent);
};
// Note:
//   The version of dasm used here logs error messages to stdout
//   not stderror.
window.dasm_log_stdout = function (msg) {
    stdOut.push(msg);
};
//# sourceMappingURL=dasm-bundle.js.map
