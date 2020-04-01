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

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

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

var onload = function () {
    showSection("main");
    return;
};
// Fires when the user goes back or forward in the history.
window.onpopstate = function (e) {
    var section = e.state && e.state.section;
    var routesToSkip = ["filelist"];
    if (section) {
        if (routesToSkip.indexOf(section) >= 0) {
            this.history.back();
            return;
        }
        showSection(section);
    }
};
// Wire up the section handling too
var hideAllSections = function () {
    var sections = document.querySelectorAll("section");
    Array.from(sections).forEach(function (section) {
        section.style.display = "none";
    });
};
var showSection = (function (sectionId) {
    hideAllSections();
    var selector = "section[data-section-id='" + sectionId + "']";
    var el = document.querySelector(selector);
    el.style.display = "";
});
var gotoSection = function (section) {
    showSection(section);
    return;
};
document.body.addEventListener("click", function (event) {
    var _a;
    var t = event.target;
    if ((_a = t === null || t === void 0 ? void 0 : t.dataset) === null || _a === void 0 ? void 0 : _a.goto) {
        // gotoSection(t.dataset.goto);
        showSection(t.dataset.goto);
    }
});
var route = {
    onload: onload,
    hideAllSections: hideAllSections,
    gotoSection: gotoSection,
};

// const input = document.querySelector(".editor");
// const compileButton = document.querySelector(".js-compile-button");
// const runButton = document.querySelector(".js-run-button");
// const stepButton = document.querySelector(".js-step-button");
var cm;
var lastLineMarker = -1;
var ERROR_STATE_CLASS = "cm-editor-line-error";
var init = function (onchange) {
    cm = CodeMirror.fromTextArea(document.querySelector(".editor"), {
        lineNumbers: true,
        theme: "dasm",
        lineWrapping: true,
        gutters: ["CodeMirror-linenumbers", "breakpoints"],
        fixedGutter: true,
        styleActiveLine: true,
    });
    cm.on('change', function () {
        if (typeof onchange === "function") {
            onchange();
        }
    });
    cm.on("gutterClick", function (cm, n) {
        var info = cm.lineInfo(n);
        var mode = (!info.gutterMarkers || !info.gutterMarkers.breakpoints);
        cm.setGutterMarker(n, "breakpoints", !mode ? null : makeMarker());
    });
    function makeMarker() {
        var marker = document.createElement("div");
        marker.style.color = "#822";
        marker.innerHTML = "●";
        return marker;
    }
};
var setLineMarker = function (line) {
    clearLineMarker(lastLineMarker);
    lastLineMarker = line;
    var marker = document.createElement("span");
    marker.innerHTML = "▶";
    marker.style.color = "green";
    marker.style.background = "black";
    cm.setGutterMarker(line - 1, "active-lines", marker);
    cm.scrollIntoView({ line: line - 1, ch: 0 }, 10);
};
var clearLineMarker = function (line) {
    cm.setGutterMarker(line - 1, "active-lines", null);
};
var setValue = function (value) {
    cm.setValue(value);
};
var getValue = function () {
    return cm.getValue();
};
var clearAllErrors = function () {
    cm.eachLine(function (f) {
        cm.removeLineClass(f, "background", ERROR_STATE_CLASS);
    });
};
var setErrors = function (errors) {
    clearAllErrors();
    errors.forEach(function (l) {
        cm.addLineClass(l - 1, "background", ERROR_STATE_CLASS);
    });
};
var jumpToLine = function (i) {
    var t = cm.charCoords({ line: i, ch: 0 }, "local").top;
    var middleHeight = cm.getScrollerElement().offsetHeight / 2;
    cm.scrollTo(null, t - middleHeight - 5);
    cm.setCursor(i - 1, 0);
    cm.focus();
};
var editor = {
    init: init,
    setValue: setValue,
    getValue: getValue,
    setLineMarker: setLineMarker,
    clearAllErrors: clearAllErrors,
    setErrors: setErrors,
    jumpToLine: jumpToLine,
};

var fileList = (function () {
    var pickFile = function (cw, dir, callback) { return __awaiter(void 0, void 0, void 0, function () {
        var container, reply;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    container = document.querySelector(".filelist");
                    container.innerHTML = "";
                    return [4 /*yield*/, fileXfer.sendMessage(cw, {
                            action: 'getFileList',
                            dir: dir,
                            messageID: 0,
                        })];
                case 1:
                    reply = _a.sent();
                    (reply.files || []).forEach(function (l) {
                        var li = document.createElement("li");
                        var a = document.createElement("a");
                        var t = document.createTextNode(l.displayName);
                        a.href = "#" + l.fullPath;
                        a.appendChild(t);
                        li.appendChild(a);
                        li.classList.add("filelist-item");
                        container.appendChild(li);
                        a.addEventListener("click", function (event) { return __awaiter(void 0, void 0, void 0, function () {
                            var target, thisname, d, selectedFileResult;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        event.preventDefault();
                                        target = event === null || event === void 0 ? void 0 : event.target;
                                        thisname = ((_a = target === null || target === void 0 ? void 0 : target.href) === null || _a === void 0 ? void 0 : _a.split("#")[1]) || "--";
                                        if (!reply.files) return [3 /*break*/, 3];
                                        d = reply.files.filter(function (a) { return a.fullPath === thisname; })[0];
                                        if (!(d.type === fileXfer.TYPE_FILE)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, fileXfer.sendMessage(cw, {
                                                action: 'readTextFile',
                                                messageID: 0,
                                                filename: thisname,
                                            })];
                                    case 1:
                                        selectedFileResult = _b.sent();
                                        callback({
                                            filename: thisname,
                                            contents: (selectedFileResult === null || selectedFileResult === void 0 ? void 0 : selectedFileResult.contents) || "",
                                        });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        pickFile(cw, thisname, callback);
                                        _b.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    return {
        pickFile: pickFile,
    };
})();

var goButton = document.querySelector(".js-go-button");
var assembleButton = document.querySelector(".js-compile-button");
var editFileButton = document.querySelector(".js-edit-file-button");
var loadFileButton = document.querySelector(".js-load-file-button");
var assembleOutput = document.querySelector("#assemble-output");
var menuButton = document.querySelector(".js-show-menu");
var systemWindow;
var DASM_IFRAME_ID = "dasm-iframe";
var editorFlags = {
    canAssemble: true,
    canRun: false,
};
var destroydasmIframe = function () { return __awaiter(void 0, void 0, void 0, function () {
    var oldiframe;
    return __generator(this, function (_a) {
        oldiframe = document.getElementById(DASM_IFRAME_ID);
        if (oldiframe) {
            oldiframe.parentNode.removeChild(oldiframe);
        }
        return [2 /*return*/];
    });
}); };
var loadDasmIFrame = function () { return __awaiter(void 0, void 0, void 0, function () {
    var dasmIframe;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, destroydasmIframe()];
            case 1:
                _a.sent();
                dasmIframe = document.createElement("iframe");
                dasmIframe.id = DASM_IFRAME_ID;
                dasmIframe.src = "dasm.html";
                dasmIframe.style.display = "none";
                document.body.appendChild(dasmIframe);
                return [4 /*yield*/, fileXfer.waitForPong()];
            case 2:
                _a.sent();
                return [2 /*return*/, dasmIframe.contentWindow];
        }
    });
}); };
var loadSystemIFrame = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var systemdiv, systemIframe;
    return __generator(this, function (_a) {
        systemdiv = document.querySelector(".system");
        if (systemdiv.firstChild) {
            systemdiv.removeChild(systemdiv.firstChild);
        }
        systemIframe = document.createElement("iframe");
        systemIframe.id = "system-iframe";
        systemIframe.src = url;
        systemdiv.appendChild(systemIframe);
        // await fileXfer.waitForPong();
        return [2 /*return*/, systemIframe.contentWindow];
    });
}); };
var assemble = function (assemblerWindow, filename, src) { return __awaiter(void 0, void 0, void 0, function () {
    var sendmessagereply, assembleResult, errorLines, msg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                route.gotoSection("wait");
                return [4 /*yield*/, fileXfer.sendMessage(assemblerWindow, {
                        messageID: 0,
                        action: 'writeTextFile',
                        filename: filename + ".asm",
                        contents: src,
                    })];
            case 1:
                sendmessagereply = _a.sent();
                return [4 /*yield*/, fileXfer.sendMessage(assemblerWindow, {
                        messageID: 0,
                        action: 'unlinkFile',
                        filename: filename + ".bin",
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, fileXfer.sendMessage(assemblerWindow, {
                        messageID: 0,
                        action: 'runAssembler',
                        filename: "" + filename,
                    })];
            case 3:
                assembleResult = _a.sent();
                errorLines = assembleResult.errors.map(function (e) { return e.line; });
                if (errorLines.length === 0) {
                    msg = {
                        action: "send-rom",
                        json: JSON.stringify(assembleResult.binary),
                    };
                    console.log("Posting " + msg.action);
                    systemWindow.postMessage(JSON.stringify(msg), ORIGIN);
                }
                else {
                    editor.setErrors(errorLines);
                    assembleOutput.innerHTML = assembleResult.errors.map(function (l) {
                        return "<a href=\"#\"\n                 data-error-message=\"" + l.error + "\"\n                 data-line=\"" + l.line + "\"\n                 data-file=\"" + l.file + "\">\n                 Error: Line " + l.line + ": " + l.error + "\n               </a>";
                    }).join("<br>");
                    editorFlags.canRun = !assembleResult.errors.length;
                }
                route.gotoSection("editor");
                return [2 /*return*/, assembleResult];
        }
    });
}); };
var wireButtons = function () {
    var lineMappings;
    var runAssemble = function (filename, src) { return __awaiter(void 0, void 0, void 0, function () {
        var assemblerWindow, assembleResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadDasmIFrame()];
                case 1:
                    assemblerWindow = _a.sent();
                    return [4 /*yield*/, assemble(assemblerWindow, filename, src)];
                case 2:
                    assembleResult = _a.sent();
                    destroydasmIframe();
                    // console.log(assembleResult.listing);
                    lineMappings = buildLineMappings((assembleResult === null || assembleResult === void 0 ? void 0 : assembleResult.listing) || "--");
                    updateButtons();
                    return [2 /*return*/];
            }
        });
    }); };
    goButton.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runAssemble("/file", editor.getValue())];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    assembleButton.addEventListener("click", function () {
        runAssemble("/file", editor.getValue());
    });
    editFileButton.addEventListener("click", function () {
        route.gotoSection("editor");
    });
    document.addEventListener("click", function (e) {
        var t = event.target;
        if (t && t.dataset.errorMessage) {
            var val = t.dataset.line;
            editor.jumpToLine(+val);
        }
    });
};
var buildLineMappings = function (listing) {
    var map = [];
    var file = "";
    var line = 0;
    var address = 0;
    listing.split(/\r\n|\r|\n/).forEach(function (s) {
        var cps = s
            .replace(/\t/g, " ")
            .replace(/  /g, " ")
            .trim();
        var bits = cps.split(/ /);
        if (bits[0] === "-------" && bits[1] === "FILE") {
            file = bits[2];
            return;
        }
        if (bits[1] === undefined) {
            return;
        }
        line = parseInt(bits[0], 10);
        address = parseInt(bits[1], 16);
        var f = (line > 0)
            && (bits[1].length === 4)
            && (address > 0);
        if (f) {
            map[address] = {
                line: line,
                file: file,
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
};
var updateButtons = function () {
    var editorPanel = document.querySelector(".CodeMirror");
    editorPanel.style.display = "";
    if (editorFlags.canAssemble) {
        assembleButton.disabled = false;
        goButton.disabled = false;
    }
};
var onCodeChange = function () {
    editorFlags.canAssemble = true;
    editorFlags.canRun = false;
    updateButtons();
};
window.main_init = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                editor.init(onCodeChange);
                editor.setValue("\n\t; Placeholder\n\t  PROCESSOR 6502\n\t  ORG $0600\n\t  RTS\n\t; Placeholder");
                return [4 /*yield*/, loadSystemIFrame("systems/fantasy-console/fc.html")];
            case 1:
                systemWindow = _a.sent();
                wireButtons();
                route.onload();
                route.gotoSection("editor");
                menuButton.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        route.gotoSection("main");
                        return [2 /*return*/];
                    });
                }); });
                loadFileButton.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var assemberWindow;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                route.gotoSection("filelist");
                                return [4 /*yield*/, loadDasmIFrame()];
                            case 1:
                                assemberWindow = _a.sent();
                                fileList.pickFile(assemberWindow, "/examples", function (file) { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        route.gotoSection("editor");
                                        editor.setValue(file.contents);
                                        destroydasmIframe();
                                        return [2 /*return*/];
                                    });
                                }); });
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=main-bundle.js.map
