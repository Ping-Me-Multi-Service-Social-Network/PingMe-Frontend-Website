const fs = require('fs');
let c = fs.readFileSync('src/features/websocket/hooks/useChatSocketHandler.ts', 'utf8');

c = c.replace(
  '    },\n    [setRooms]\n  );',
  '    },\n    [setRooms]\n  );\n\n  const handleMessageUpdated = useCallback(\n    (event: MessageUpdatedEventPayload) => {\n      const message = event.messageResponse;\n      setRooms((prev) => {\n        const targetRoom = prev.find((r) => r.roomId === message.roomId);\n        if (!targetRoom) return prev;\n\n        if (targetRoom.lastMessage?.messageId === message.id) {\n          const updatedRoom = {\n            ...targetRoom,\n            lastMessage: {\n              ...targetRoom.lastMessage,\n              preview: message.content,\n            },\n          };\n          const otherRooms = prev.filter((r) => r.roomId !== message.roomId);\n          return [updatedRoom, ...otherRooms];\n        }\n        return prev;\n      });\n    },\n    [setRooms]\n  );'
).replace(
  '    },\r\n    [setRooms]\r\n  );',
  '    },\r\n    [setRooms]\r\n  );\r\n\r\n  const handleMessageUpdated = useCallback(\r\n    (event: MessageUpdatedEventPayload) => {\r\n      const message = event.messageResponse;\r\n      setRooms((prev) => {\r\n        const targetRoom = prev.find((r) => r.roomId === message.roomId);\r\n        if (!targetRoom) return prev;\r\n\r\n        if (targetRoom.lastMessage?.messageId === message.id) {\r\n          const updatedRoom = {\r\n            ...targetRoom,\r\n            lastMessage: {\r\n              ...targetRoom.lastMessage,\r\n              preview: message.content,\r\n            },\r\n          };\r\n          const otherRooms = prev.filter((r) => r.roomId !== message.roomId);\r\n          return [updatedRoom, ...otherRooms];\r\n        }\r\n        return prev;\r\n      });\r\n    },\r\n    [setRooms]\r\n  );'
);

c = c.replace(
  'SocketManager.on("MESSAGE_CREATED", handleNewMessage),',
  'SocketManager.on("MESSAGE_CREATED", handleNewMessage),\n      SocketManager.on("MESSAGE_UPDATED", handleMessageUpdated),'
).replace(
  'SocketManager.on("MESSAGE_CREATED", handleNewMessage),\r\n',
  'SocketManager.on("MESSAGE_CREATED", handleNewMessage),\r\n      SocketManager.on("MESSAGE_UPDATED", handleMessageUpdated),\r\n'
);

c = c.replace(
  '    handleNewMessage,\n    handleRecallMessage,',
  '    handleNewMessage,\n    handleMessageUpdated,\n    handleRecallMessage,'
).replace(
  '    handleNewMessage,\r\n    handleRecallMessage,',
  '    handleNewMessage,\r\n    handleMessageUpdated,\r\n    handleRecallMessage,'
);

fs.writeFileSync('src/features/websocket/hooks/useChatSocketHandler.ts', c);
