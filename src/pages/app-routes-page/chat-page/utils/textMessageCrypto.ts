import type { MessageResponse } from "@/types/chat/message";
import type { RoomResponse } from "@/types/chat/room";

const ENCRYPTED_TEXT_PREFIX = "pmenc:v1:";
const KEY_MATERIAL_PREFIX = "pingme:text-message:v1";
const IV_LENGTH = 12;

export const MAX_ENCRYPTED_TEXT_CONTENT_LENGTH = 1000;
export const ENCRYPTED_TEXT_PREVIEW = "Tin nhắn mã hóa";
export const DECRYPT_TEXT_FAILURE = "Không thể giải mã tin nhắn";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function isEncryptedTextContent(content?: string | null): boolean {
  return typeof content === "string" && content.startsWith(ENCRYPTED_TEXT_PREFIX);
}

export function getRoomTextEncryptionMaterial(room: RoomResponse): string {
  const participantIds = room.participants
    .map((participant) => participant.userId)
    .sort((a, b) => a - b)
    .join(",");

  return [
    KEY_MATERIAL_PREFIX,
    `room:${room.roomId}`,
    `type:${room.roomType}`,
    `direct:${room.directKey ?? ""}`,
    `participants:${participantIds}`,
  ].join("|");
}

export async function encryptTextMessageContent(
  plaintext: string,
  room: RoomResponse,
): Promise<string> {
  assertWebCryptoAvailable();

  const key = await deriveAesKey(room);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext),
  );

  return `${ENCRYPTED_TEXT_PREFIX}${toBase64Url(iv)}.${toBase64Url(new Uint8Array(encrypted))}`;
}

export async function decryptTextMessageContent(
  content: string,
  room: RoomResponse,
): Promise<string> {
  assertWebCryptoAvailable();

  if (!isEncryptedTextContent(content)) {
    return content;
  }

  const payload = content.slice(ENCRYPTED_TEXT_PREFIX.length);
  const [ivPart, ciphertextPart] = payload.split(".");
  if (!ivPart || !ciphertextPart) {
    throw new Error("Invalid encrypted text payload");
  }

  const key = await deriveAesKey(room);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64Url(ivPart) },
    key,
    fromBase64Url(ciphertextPart),
  );

  return decoder.decode(decrypted);
}

export async function decryptTextMessageForRoom(
  message: MessageResponse,
  room: RoomResponse,
): Promise<MessageResponse> {
  let content = message.content;
  let repliedMessage = message.repliedMessage;
  const isEncryptedText = message.type === "TEXT" && isEncryptedTextContent(content);

  if (isEncryptedText) {
    content = await decryptSafely(content, room);
  }

  if (
    repliedMessage?.type === "TEXT" &&
    repliedMessage.content &&
    isEncryptedTextContent(repliedMessage.content)
  ) {
    repliedMessage = {
      ...repliedMessage,
      content: await decryptSafely(repliedMessage.content, room),
    };
  }

  if (content === message.content && repliedMessage === message.repliedMessage) {
    return message;
  }

  return {
    ...message,
    content,
    repliedMessage,
    isEncryptedText,
  };
}

export async function decryptTextMessagesForRoom(
  messages: MessageResponse[],
  room: RoomResponse,
): Promise<MessageResponse[]> {
  return Promise.all(messages.map((message) => decryptTextMessageForRoom(message, room)));
}

async function decryptSafely(content: string, room: RoomResponse): Promise<string> {
  try {
    return await decryptTextMessageContent(content, room);
  } catch (error) {
    console.warn("[ChatCrypto] Failed to decrypt text message", error);
    return DECRYPT_TEXT_FAILURE;
  }
}

async function deriveAesKey(room: RoomResponse): Promise<CryptoKey> {
  const material = encoder.encode(getRoomTextEncryptionMaterial(room));
  const digest = await crypto.subtle.digest("SHA-256", material);
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function assertWebCryptoAvailable(): void {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API is not available in this browser");
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}
