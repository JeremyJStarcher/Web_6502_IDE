var scaleElement = function (conWidth, conHeight, canvas) {
    // Go back to full size
    canvas.style.transform = "translate(0px, 0px) scale(1)";
    var minDimension = Math.min(conWidth, conHeight);
    var newScale = minDimension / canvas.offsetWidth;
    var newHeight = canvas.offsetHeight * newScale;
    var newWidth = canvas.offsetWidth * newScale;
    var offsetWidth = (canvas.offsetWidth - newWidth) / 2;
    var offsetHeight = (canvas.offsetHeight - newHeight) / 2;
    canvas.style.transform = "translate(" + -offsetWidth + "px, " + -offsetHeight + "px) scale(" + newScale + ")";
};

// Don't use the resize event -- sometimes the canvas and iframe
// is hidden and therefore has a size of 0.  The ResizeObserver
// doesn't have universal support.
var r = function () {
    var canvas = document.querySelector("canvas");
    var _a = window.parent.GET_IFRAME_SIZE(), width = _a.width, height = _a.height;
    scaleElement(width, height, canvas);
    setTimeout(r, 500);
};
r();
var CPU_SPEEDS = (function () {
    var _1MHz = 1000000;
    var percents = [0.1, 1, 10, 25, 50, 100, 147];
    return percents.map(function (percent) {
        var speed = _1MHz * (percent / 100);
        var words = (speed / _1MHz).toFixed(3) + " Mhz";
        return {
            speed: speed,
            words: words,
        };
    });
})();
window.addEventListener('message', function (e) {
    var m = JSON.parse(e.data);
    var boot_machine = Module.cwrap('boot_machine', null, ['void']);
    if (m.action === "send-rom") {
        var bin = Uint8Array.from(JSON.parse(m.json));
        FS.writeFile("/file.rom", bin);
        boot_machine();
        console.log("Glory! Received new ROM of " + bin.length);
    }
}, false);
window.addEventListener("keydown", function (e) {
    var write6502 = Module.cwrap('write6502', 'void', ['number', 'number']);
    var ascii = e.key.charCodeAt(0);
    console.log(ascii, e.key, e.keyCode);
    write6502(0xFF, ascii);
});
//# sourceMappingURL=fc-bundle.js.map
