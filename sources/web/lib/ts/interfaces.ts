interface BuildErrors {
    file: string;
    line: number;
    code: string;
    error: string;
}

interface BaseSendMessageRequest {
    messageID: number;
    action: string;
}

interface GetFileListRequest extends BaseSendMessageRequest {
    action: "getFileList",
    dir: string;
}

interface BaseSendMessageResponse {
    isSuccess?: boolean;
    messageID: number;
}

interface DirectoryList {
    displayName: string;
    name: string;
    type: string;
    fullPath: string;
}

interface GetFileListResponse extends BaseSendMessageResponse {
    files: DirectoryList[];
};

interface ReadTextFileRequest extends BaseSendMessageRequest {
    action: 'readTextFile';
    filename: string;
}

interface ReadTextFileResponse extends BaseSendMessageResponse {
    contents: string;
}

interface WriteTextFileRequest extends BaseSendMessageRequest {
    action: 'writeFile';
    filename: string;
    contents: string;
}

interface WriteTextFileResponse extends BaseSendMessageResponse {

}

interface ReadBinaryFileRequest extends BaseSendMessageRequest {
    action: 'readBinaryFile';
    filename: string;
}

interface ReadBinaryFileResponse extends BaseSendMessageResponse {
    contents: number[];
}

interface UnlinkFileRequest extends BaseSendMessageRequest {
    action: 'unlinkFile';
    filename: string;
}

interface UnlinkFileResponse extends BaseSendMessageResponse {
}

interface RunAssemblerRequest extends BaseSendMessageRequest {
    action: 'runAssembler';
    filename: string;
}

interface RunAssemblerResponse extends BaseSendMessageResponse {
    errors: BuildErrors[];
    stdout: string[];
    listing: string;
    binary: number[];
}

type SendMessageType =
    GetFileListRequest |
    ReadBinaryFileRequest |
    UnlinkFileRequest |
    WriteTextFileRequest |
    RunAssemblerRequest |
    ReadTextFileRequest;