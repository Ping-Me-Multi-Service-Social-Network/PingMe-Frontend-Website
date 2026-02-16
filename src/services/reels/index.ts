import * as reels from "./reels";
import * as comments from "./reel-comments";
import * as admin from "./admin-reels";

export const reelsApi = {
  ...reels,
  ...comments,
  ...admin,
};
