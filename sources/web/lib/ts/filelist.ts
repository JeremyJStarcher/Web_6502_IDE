import common from "./common.js";

interface PickFileResult {
    filename: string;
    contents: string;
}

export const fileList = (() => {
    const pickFile = async (
        cw: Window,
        dir: string,
        callback: (s: PickFileResult) => void) => {
        const container = document.querySelector(".filelist") as HTMLElement;
        container.innerHTML = "";

        const reply = await common.sendMessageAwaitReply(cw, {
            action: 'getFileList',
            dir: dir,
        });

        (reply.files || []).forEach((l) => {
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

                if (reply.files) {
                    const d = reply.files.filter((a) => a.fullPath === thisname)[0];

                    if (d.type === common.TYPE_FILE) {

                        const selectedFileResult = await common.sendMessageAwaitReply(cw, {
                            action: 'readTextFile',
                            filename: thisname,
                        });

                        callback({
                            filename: thisname,
                            contents: selectedFileResult?.contents || "",
                        });
                    } else {
                        pickFile(cw, thisname, callback);
                    }
                }
            });
    });
};

return {
    pickFile,
}
}) ();
