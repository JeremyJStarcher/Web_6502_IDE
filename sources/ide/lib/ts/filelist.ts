const TYPE_FILE = 'F';
const TYPE_DIR = 'D';

interface PickFileResult {
    filename: string;
    contents: string;
}

const examples = [
    "adventure",
    "alive",
    "backandforth",
    "byterun",
    "calculator",
    "colors",
    "compo-May07-1st",
    "compo-May07-2nd",
    "compo-May07-3rd",
    "demoscene",
    "disco",
    "fullscreenlogo",
    "gameoflife",
    "noise",
    "random",
    "rle",
    "rorshach",
    "screenpatterns",
    "selfmodify",
    "sierpinski",
    "skier",
    "softsprites",
    "spacer",
    "splashscreen",
    "starfield2d",
    "triangles",
    "zookeeper",
];


const getFileListEvent = (dir: string) => {

    const list = examples.map((file) => {

        const r: DirectoryList = {
            displayName: file,
            name: file,
            type: TYPE_FILE,
            fullPath: `examples/${file}/main.asm`,
        };

        return r;
    });

    return list;
};


export const fileList = (() => {
    const pickFile = async (
        dir: string,
        callback: (s: PickFileResult) => void) => {
        const container = document.querySelector(".filelist") as HTMLElement;
        container.innerHTML = "";

        const reply = getFileListEvent(dir);

        (reply || []).forEach((l) => {
            const li = document.createElement("li");
            const a = document.createElement("a");

            const t = document.createTextNode(l.displayName);

            a.href = `#${l.fullPath}`;
            a.appendChild(t);
            li.appendChild(a);

            li.classList.add("filelist-item");
            container.appendChild(li);

            a.addEventListener("click", async (event) => {
                event.preventDefault();
                const target = event?.target as HTMLLinkElement;

                const thisname = target?.href?.split("#")[1] || "--";

                if (reply) {
                    const d = reply.filter((a) => a.fullPath === thisname)[0];

                    if (d.type === TYPE_FILE) {
                        fetch(d.fullPath).then(src => {
                            src.text().then(code => {
                                callback({
                                    filename: thisname,
                                    contents: code,
                                });
                            });
                        });

                    } else {
                        pickFile(thisname, callback);
                    }
                }
            });
        });
    };

    return {
        pickFile,
    }
})();
