import type { UUID } from "crypto"
import type { Attachment } from "./attachment"

export type AIMessage = {
 id: UUID;
 chatRoomId: UUID;
 userId: Number;
 type: "SENT"|"RECEIVED";
 content: string;
 attachments: Attachment[];
 createdAt: Date;  
}