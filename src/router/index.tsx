import AuthPage from "@/pages/main-routes-page/auth-page";
import ChatPage from "@/pages/chat-routes-page";
import ContactsPage from "@/pages/chat-routes-page/contact-page";
import MessagesPage from "@/pages/chat-routes-page/messages-page";
import HomePage from "@/pages/main-routes-page/home-page";
import RootPage from "@/pages/main-routes-page/RootPage";
import ProfilePage from "@/pages/main-routes-page/user-page";
import ChangePasswordPage from "@/pages/main-routes-page/user-page/change-password-page";
import DeviceManagementPage from "@/pages/main-routes-page/user-page/device-management-page";
import UserInfoPage from "@/pages/main-routes-page/user-page/user-info-page";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/pages/commons/ProtectedRoute";
import BlogPage from "@/pages/main-routes-page/blog-page";
import AdminPage from "@/pages/admin-route-pages";
import AccountManagementPage from "@/pages/admin-route-pages/account-management-page";
import BlogManagementPage from "@/pages/admin-route-pages/blog-management-page";
import StatisticsManagementPage from "@/pages/admin-route-pages/statistics-management-page";
import UpsertBlogPage from "@/pages/main-routes-page/blog-page/upsert-blog-page";
import BlogDetailsPage from "@/pages/main-routes-page/blog-page/blog-details-page";
import { AdminRoute } from "@/pages/commons/AdminRoute";
import MusicPage from "@/pages/music-page";
import SharedChatMusicLayout from "@/pages/chat-routes-page/components/SharedChatMusicLayout";

export const router = createBrowserRouter([
  {
    path: "",
    element: <RootPage />,
    children: [
      { index: true, element: <Navigate to="/home" /> },
      { path: "home", element: <HomePage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "blogs", element: <BlogPage /> },
      { path: "blogs/:id", element: <BlogDetailsPage /> },
      {
        path: "blogs/upsert/:id?",
        element: (
          <ProtectedRoute>
            <UpsertBlogPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/profile/user-info" /> },
          { path: "user-info", element: <UserInfoPage /> },
          { path: "change-password", element: <ChangePasswordPage /> },
          { path: "device-management", element: <DeviceManagementPage /> },
        ],
      },
    ],
  },
  {
    path: "chat",
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/chat/messages" /> },
      { path: "messages", element: <MessagesPage /> },
      { path: "contacts", element: <ContactsPage /> },
    ],
  },
  {
    path: "music",
    element: (
      <ProtectedRoute>
        <SharedChatMusicLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <MusicPage /> }],
  },
  {
    path: "admin",
    element: (
      <AdminRoute>
        <AdminPage />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/accounts" /> },
      { path: "accounts", element: <AccountManagementPage /> },
      { path: "blogs", element: <BlogManagementPage /> },
      { path: "statistics", element: <StatisticsManagementPage /> },
    ],
  },
]);
