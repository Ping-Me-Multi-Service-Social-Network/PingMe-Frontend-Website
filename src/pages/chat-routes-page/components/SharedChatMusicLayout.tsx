import { Outlet } from "react-router-dom";
import ChatNavigation from "./ChatNavigation";

export default function SharedChatMusicLayout() {
  return (
    <div className="h-full bg-gray-100 flex">
      <ChatNavigation />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
