import type { UUID } from "crypto";

export type AIChatResponse = {
 content: string;
 chatRoomId: UUID;
 isNewRoom: boolean;   
}