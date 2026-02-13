import type { UUID } from "crypto"

export type AIChatRoomInformation = {
 id: UUID;
 userId: Number;
 title: string;
 createdAt: Date;
 updatedAt: Date;   
}
