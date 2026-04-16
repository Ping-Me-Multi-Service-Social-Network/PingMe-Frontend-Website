const fs = require('fs');

let c = fs.readFileSync('src/features/websocket/core/socketManager.ts', 'utf8');

c = c.replace(
  'messageCreated,', 
  'messageCreated,\n  messageUpdated,'
);

c = c.replace(
  'MessageCreatedEventPayload,', 
  'MessageCreatedEventPayload,\n  MessageUpdatedEventPayload,'
);

c = c.replace(
  'MESSAGE_CREATED: MessageCreatedEventPayload;', 
  'MESSAGE_CREATED: MessageCreatedEventPayload;\n  MESSAGE_UPDATED: MessageUpdatedEventPayload;'
);

c = c.replace(
  'MessageCreatedEventPayload | MessageRecalledEventPayload', 
  'MessageCreatedEventPayload | MessageUpdatedEventPayload | MessageRecalledEventPayload'
);

c = c.replace(
  'this.emit("MESSAGE_CREATED", ev as MessageCreatedEventPayload);\r\n            break;', 
  'this.emit("MESSAGE_CREATED", ev as MessageCreatedEventPayload);\r\n            break;\r\n          case "MESSAGE_UPDATED":\r\n            this.options?.dispatch(messageUpdated(ev as MessageUpdatedEventPayload));\r\n            this.emit("MESSAGE_UPDATED", ev as MessageUpdatedEventPayload);\r\n            break;'
);

c = c.replace(
  'this.emit("MESSAGE_CREATED", ev as MessageCreatedEventPayload);\n            break;', 
  'this.emit("MESSAGE_CREATED", ev as MessageCreatedEventPayload);\n            break;\n          case "MESSAGE_UPDATED":\n            this.options?.dispatch(messageUpdated(ev as MessageUpdatedEventPayload));\n            this.emit("MESSAGE_UPDATED", ev as MessageUpdatedEventPayload);\n            break;'
);

fs.writeFileSync('src/features/websocket/core/socketManager.ts', c);
console.log('Update success');
