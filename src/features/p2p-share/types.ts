export type TransferMode = 'send' | 'receive';

export type ConnectionStatus =
    | 'idle'
    | 'initializing'
    | 'ready'
    | 'connecting'
    | 'connected'
    | 'error'
    | 'disconnected';

export type DataType = 'text' | 'file';

export interface TransferFile {
    name: string;
    mimeType: string;
    size: number;
    data: ArrayBuffer;
}

export interface TransferPayload {
    type: DataType;
    text?: string;
    file?: TransferFile;
}

export interface ReceivedItem {
    id: string;
    payload: TransferPayload;
    timestamp: number;
}
