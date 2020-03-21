
export const ORIGIN = (() => {
    var b = window.location.href.split("/");
    return [b[0], b[1], b[2]].join("/");
})();
