import AuthPage from "@/pages/public-routes-page/auth-page";
import ContactsPage from "@/pages/app-routes-page/contact-page";
import MessagesPage from "@/pages/app-routes-page/chat-page";
import HomePage from "@/pages/public-routes-page/home-page";
import RootPageLayout from "@/pages/public-routes-page";
import ProfilePage from "@/pages/app-routes-page/user-page";
import ChangePasswordPage from "@/pages/app-routes-page/user-page/change-password-page";
import DeviceManagementPage from "@/pages/app-routes-page/user-page/device-management-page";
import UserInfoPage from "@/pages/app-routes-page/user-page/user-info-page";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/pages/commons/ProtectedRoute";
import BlogPage from "@/pages/app-routes-page/blog-page";
import AdminPage from "@/pages/admin-route-pages";
import AccountManagementPage from "@/pages/admin-route-pages/account-management-page";
import BlogManagementPage from "@/pages/admin-route-pages/blog-management-page";
import StatisticsManagementPage from "@/pages/admin-route-pages/statistics-management-page";
import UpsertBlogPage from "@/pages/app-routes-page/blog-page/upsert-blog-page";
import BlogDetailsPage from "@/pages/app-routes-page/blog-page/blog-details-page";
import { AdminRoute } from "@/pages/commons/AdminRoute";
import MusicPage from "@/pages/app-routes-page/music-page";
import AppPageLayout from "@/pages/app-routes-page";
import ExpensePage from "@/pages/app-routes-page/expense-page";
import ReelsPage from "@/pages/app-routes-page/reels-page";
import VideoManagerPage from "@/pages/app-routes-page/reels-page/video-manager";
import SearchResultsPage from "@/pages/app-routes-page/reels-page/search-results";
import MusicManagementPage from "@/pages/admin-route-pages/music-management-page";
import AlbumManagementPage from "@/pages/admin-route-pages/album-management-page";
import ArtistManagementPage from "@/pages/admin-route-pages/artist-management-page";
import GenreManagementPage from "@/pages/admin-route-pages/genre-management-page";
import ReelManagementPage from "@/pages/admin-route-pages/reel-management-page";
import SongListPage from "@/pages/app-routes-page/music-page/components/SongListPage";
import AlbumsPage from "@/pages/app-routes-page/music-page/components/AlbumsPage";
import ArtistsPage from "@/pages/app-routes-page/music-page/components/ArtistsPage";
import RankingsPage from "@/pages/app-routes-page/music-page/components/RankingsPage";
import FavoritesPage from "@/pages/app-routes-page/music-page/components/FavoritesPage";
import PlaylistsPage from "@/pages/app-routes-page/music-page/components/PlaylistsPage";
import PlaylistDetailPage from "@/pages/app-routes-page/music-page/components/PlaylistDetailPage";
import DiscoverPlaylistsPage from "@/pages/app-routes-page/music-page/components/DiscoverPlaylistsPage";
import MusicLayout from "@/pages/app-routes-page/music-page/components/MusicLayout";

export const router = createBrowserRouter([
  // ===========================================================
  // PUBLIC ROUTES
  // ===========================================================
  {
    path: "/",
    element: <RootPageLayout />,
    children: [
      { index: true, element: <Navigate to="/home" /> },
      { path: "home", element: <HomePage /> },
      { path: "auth", element: <AuthPage /> },
    ],
  },

  // ===========================================================
  // APP ROUTES
  // ===========================================================
  {
    path: "app",
    element: (
      <ProtectedRoute>
        <AppPageLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "blogs/upsert/:id?",
        element: (
          <ProtectedRoute>
            <UpsertBlogPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "expenses",
        element: (
          <ProtectedRoute>
            <ExpensePage />
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
          { index: true, element: <Navigate to="/app/profile/user-info" /> },
          { path: "user-info", element: <UserInfoPage /> },
          { path: "change-password", element: <ChangePasswordPage /> },
          { path: "device-management", element: <DeviceManagementPage /> },
        ],
      },
      { path: "chat", element: <MessagesPage /> },
      { path: "contacts", element: <ContactsPage /> },
      {
        path: "music",
        element: <MusicLayout />,
        children: [
          { index: true, element: <MusicPage /> },
          { path: "songs", element: <SongListPage /> },
          { path: "albums", element: <AlbumsPage /> },
          { path: "artists", element: <ArtistsPage /> },
          { path: "rankings", element: <RankingsPage /> },
          { path: "favorites", element: <FavoritesPage /> },
          { path: "playlists", element: <PlaylistsPage /> },
          { path: "playlists/discover", element: <DiscoverPlaylistsPage /> },
          { path: "playlists/:id", element: <PlaylistDetailPage /> },
        ],
      },
      { path: "blogs", element: <BlogPage /> },
      { path: "blogs/:id", element: <BlogDetailsPage /> },
      {
        path: "reels",
        element: <ReelsPage />,
      },
      {
        path: "reels/search",
        element: <SearchResultsPage />,
      },
      {
        path: "reels/video-manager",
        element: <VideoManagerPage />,
      },
    ],
  },

  // ===========================================================
  // ADMIN ROUTES
  // ===========================================================
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
      { path: "music", element: <MusicManagementPage /> },
      { path: "albums", element: <AlbumManagementPage /> },
      { path: "artists", element: <ArtistManagementPage /> },
      { path: "genres", element: <GenreManagementPage /> },
      { path: "reels", element: <ReelManagementPage /> },
    ],
  },
]);
