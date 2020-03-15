// const input = document.querySelector(".editor");
// const compileButton = document.querySelector(".js-compile-button");
// const runButton = document.querySelector(".js-run-button");
// const stepButton = document.querySelector(".js-step-button");
var cm;
let lastLineMarker = -1;
const ERROR_STATE_CLASS = "cm-editor-line-error";

const init = (onchange) => {
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
        let mode = (!info.gutterMarkers || !info.gutterMarkers.breakpoints);
        cm.setGutterMarker(n, "breakpoints", !mode ? null : makeMarker());
    });

    function makeMarker() {
        var marker = document.createElement("div");
        marker.style.color = "#822";
        marker.innerHTML = "●";
        return marker;
    }
};

const setLineMarker = (line) => {
    clearLineMarker(lastLineMarker);
    lastLineMarker = line;
    const marker = document.createElement("span");
    marker.innerHTML = "▶";
    marker.style.color = "green";
    marker.style.background = "black";
    cm.setGutterMarker(line - 1, "active-lines", marker);
    cm.scrollIntoView({ line: line - 1 }, 10);
};

const clearLineMarker = (line) => {
    cm.setGutterMarker(line - 1, "active-lines", null);
};

const setValue = (value) => {
    cm.setValue(value);
}

const getValue = () => {
    return cm.getValue();
}

const clearAllErrors = () => {
    cm.eachLine((f) => {
        cm.removeLineClass(f, "background", ERROR_STATE_CLASS);
    });
}

const setErrors = (errors) => {
    clearAllErrors();
    errors.forEach(l => {
        cm.addLineClass(l - 1, "background", ERROR_STATE_CLASS);
    });
}

const jumpToLine = (i) => {
    var t = cm.charCoords({ line: i, ch: 0 }, "local").top;
    var middleHeight = cm.getScrollerElement().offsetHeight / 2;
    cm.scrollTo(null, t - middleHeight - 5);
    cm.setCursor(i - 1, 0);
    cm.focus();
}

export const editor = {
    init,
    setValue,
    getValue,
    setLineMarker,
    clearAllErrors,
    setErrors,
    jumpToLine,
}
