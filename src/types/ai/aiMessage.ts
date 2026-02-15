import type { Attachment } from "./attachment"

export type AIMessage = {
 id: string;
 chatRoomId: string;
 userId: number;
 type: "SENT"|"RECEIVED";
 content: string;
 attachments: Attachment[];
 createdAt: string;
}