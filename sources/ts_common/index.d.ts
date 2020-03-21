export interface FileListItem {
    displayName: string;
    fullPath: string;
    type: string;
}
declare const _default: {
    ORIGIN: string;
    sendMessage: <T extends BaseSendMessageRequest, U>(destwindow: Window, message: T) => Promise<U>;
    waitForPong: () => Promise<unknown>;
    sendPong: (destwindow: Window) => void;
    TYPE_DIR: string;
    TYPE_FILE: string;
};
export default _default;
//# sourceMappingURL=index.d.ts.map