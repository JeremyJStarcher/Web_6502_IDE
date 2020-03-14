import common from "./common.js";

export const fileList = (() => {


    const pickFile = async (cw, dir, callback) => {
        const container = document.querySelector(".filelist");
        container.innerHTML = "";

        const reply = await common.sendMessageAwaitReply(cw, {
            action: 'getFileList',
            dir: dir,
        });

        reply.files.forEach((l) => {
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

                const thisname = event.target.href.split("#")[1];
                const d = reply.files.filter((a) => a.fullPath === thisname)[0];

                if (d.type === common.TYPE_FILE) {

                    const selectedFileResult = await common.sendMessageAwaitReply(cw, {
                        action: 'readTextFile',
                        filename: thisname,
                    });

                    callback({
                        filename: thisname,
                        contents: selectedFileResult.contents,
                    });
                } else {
                    pickFile(thisname, callback);
                }
            });
        });
    };

    return {
        pickFile,
    }
})();
