export interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
    connectPTTEP?: boolean;
    // attachments?: Attachment[];
}
// export interface Message {
//     username: string;
//     message: string;
// }

export interface Attachment {
    name: string;
    type: string;
    url?: string;
}