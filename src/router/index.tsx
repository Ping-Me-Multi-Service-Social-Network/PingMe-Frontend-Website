import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/pages/commons/ProtectedRoute";
import { AdminRoute } from "@/pages/commons/AdminRoute";
import { LazyElement } from "@/components/custom/LazyElement";

// ===========================================================
// PUBLIC PAGES
// ===========================================================
const RootPageLayout = lazy(() => import("@/pages/public-routes-page"));
const HomePage = lazy(() => import("@/pages/public-routes-page/home-page"));
const AuthPage = lazy(() => import("@/pages/public-routes-page/auth-page"));

// ===========================================================
// APP PAGES - Layout
// ===========================================================
const AppPageLayout = lazy(() => import("@/pages/app-routes-page"));

// ===========================================================
// APP PAGES - Profile
// ===========================================================
const ProfilePage = lazy(() => import("@/pages/app-routes-page/user-page"));
const UserInfoPage = lazy(
  () => import("@/pages/app-routes-page/user-page/user-info-page")
);
const ChangePasswordPage = lazy(
  () => import("@/pages/app-routes-page/user-page/change-password-page")
);
const DeviceManagementPage = lazy(
  () => import("@/pages/app-routes-page/user-page/device-management-page")
);

// ===========================================================
// APP PAGES - Chat & Contacts
// ===========================================================
const MessagesPage = lazy(() => import("@/pages/app-routes-page/chat-page"));
const ContactsPage = lazy(() => import("@/pages/app-routes-page/contact-page"));

// ===========================================================
// APP PAGES - Music
// ===========================================================
const MusicPage = lazy(() => import("@/pages/app-routes-page/music-page"));
const MusicLayout = lazy(
  () => import("@/pages/app-routes-page/music-page/components/MusicLayout")
);
const SongListPage = lazy(
  () => import("@/pages/app-routes-page/music-page/components/SongListPage")
);
const AlbumsPage = lazy(
  () => import("@/pages/app-routes-page/music-page/components/AlbumsPage")
);
const ArtistsPage = lazy(
  () => import("@/pages/app-routes-page/music-page/components/ArtistsPage")
);
const RankingsPage = lazy(
  () => import("@/pages/app-routes-page/music-page/components/RankingsPage")
);
const FavoritesPage = lazy(
  () => import("@/pages/app-routes-page/music-page/components/FavoritesPage")
);
const PlaylistsPage = lazy(
  () => import("@/pages/app-routes-page/music-page/components/PlaylistsPage")
);
const PlaylistDetailPage = lazy(
  () =>
    import("@/pages/app-routes-page/music-page/components/PlaylistDetailPage")
);
const DiscoverPlaylistsPage = lazy(
  () =>
    import(
      "@/pages/app-routes-page/music-page/components/DiscoverPlaylistsPage"
    )
);

// ===========================================================
// APP PAGES - Blogs
// ===========================================================
const BlogPage = lazy(() => import("@/pages/app-routes-page/blog-page"));
const BlogDetailsPage = lazy(
  () => import("@/pages/app-routes-page/blog-page/blog-details-page")
);
const UpsertBlogPage = lazy(
  () => import("@/pages/app-routes-page/blog-page/upsert-blog-page")
);

// ===========================================================
// APP PAGES - Reels
// ===========================================================
const ReelsPage = lazy(() => import("@/pages/app-routes-page/reels-page"));
const VideoManagerPage = lazy(
  () => import("@/pages/app-routes-page/reels-page/video-manager")
);
const SearchResultsPage = lazy(
  () => import("@/pages/app-routes-page/reels-page/search-results")
);

// ===========================================================
// ADMIN PAGES
// ===========================================================
const AdminPage = lazy(() => import("@/pages/admin-route-pages"));
const AccountManagementPage = lazy(
  () => import("@/pages/admin-route-pages/account-management-page")
);
const BlogManagementPage = lazy(
  () => import("@/pages/admin-route-pages/blog-management-page")
);
const StatisticsManagementPage = lazy(
  () => import("@/pages/admin-route-pages/statistics-management-page")
);
const MusicManagementPage = lazy(
  () => import("@/pages/admin-route-pages/music-management-page")
);
const AlbumManagementPage = lazy(
  () => import("@/pages/admin-route-pages/album-management-page")
);
const ArtistManagementPage = lazy(
  () => import("@/pages/admin-route-pages/artist-management-page")
);
const GenreManagementPage = lazy(
  () => import("@/pages/admin-route-pages/genre-management-page")
);
const ReelManagementPage = lazy(
  () => import("@/pages/admin-route-pages/reel-management-page")
);

export const router = createBrowserRouter([
  // ===========================================================
  // PUBLIC ROUTES
  // ===========================================================
  {
    path: "/",
    element: (
      <LazyElement>
        <RootPageLayout />
      </LazyElement>
    ),
    children: [
      { index: true, element: <Navigate to="/home" /> },
      {
        path: "home",
        element: (
          <LazyElement>
            <HomePage />
          </LazyElement>
        ),
      },
      {
        path: "auth",
        element: (
          <LazyElement>
            <AuthPage />
          </LazyElement>
        ),
      },
    ],
  },

  // ===========================================================
  // APP ROUTES (Protected)
  // ===========================================================
  {
    path: "app",
    element: (
      <ProtectedRoute>
        <LazyElement>
          <AppPageLayout />
        </LazyElement>
      </ProtectedRoute>
    ),
    children: [
      // ---------------------------------------------------------
      // Profile Routes
      // ---------------------------------------------------------
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <LazyElement>
              <ProfilePage />
            </LazyElement>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/app/profile/user-info" /> },
          {
            path: "user-info",
            element: (
              <LazyElement>
                <UserInfoPage />
              </LazyElement>
            ),
          },
          {
            path: "change-password",
            element: (
              <LazyElement>
                <ChangePasswordPage />
              </LazyElement>
            ),
          },
          {
            path: "device-management",
            element: (
              <LazyElement>
                <DeviceManagementPage />
              </LazyElement>
            ),
          },
        ],
      },

      // ---------------------------------------------------------
      // Chat & Contacts Routes
      // ---------------------------------------------------------
      {
        path: "chat",
        element: (
          <LazyElement>
            <MessagesPage />
          </LazyElement>
        ),
      },
      {
        path: "contacts",
        element: (
          <LazyElement>
            <ContactsPage />
          </LazyElement>
        ),
      },

      // ---------------------------------------------------------
      // Music Routes
      // ---------------------------------------------------------
      {
        path: "music",
        element: (
          <LazyElement>
            <MusicLayout />
          </LazyElement>
        ),
        children: [
          {
            index: true,
            element: (
              <LazyElement>
                <MusicPage />
              </LazyElement>
            ),
          },
          {
            path: "songs",
            element: (
              <LazyElement>
                <SongListPage />
              </LazyElement>
            ),
          },
          {
            path: "albums",
            element: (
              <LazyElement>
                <AlbumsPage />
              </LazyElement>
            ),
          },
          {
            path: "artists",
            element: (
              <LazyElement>
                <ArtistsPage />
              </LazyElement>
            ),
          },
          {
            path: "rankings",
            element: (
              <LazyElement>
                <RankingsPage />
              </LazyElement>
            ),
          },
          {
            path: "favorites",
            element: (
              <LazyElement>
                <FavoritesPage />
              </LazyElement>
            ),
          },
          {
            path: "playlists",
            element: (
              <LazyElement>
                <PlaylistsPage />
              </LazyElement>
            ),
          },
          {
            path: "playlists/discover",
            element: (
              <LazyElement>
                <DiscoverPlaylistsPage />
              </LazyElement>
            ),
          },
          {
            path: "playlists/:id",
            element: (
              <LazyElement>
                <PlaylistDetailPage />
              </LazyElement>
            ),
          },
        ],
      },

      // ---------------------------------------------------------
      // Blog Routes
      // ---------------------------------------------------------
      {
        path: "blogs",
        element: (
          <LazyElement>
            <BlogPage />
          </LazyElement>
        ),
      },
      {
        path: "blogs/:id",
        element: (
          <LazyElement>
            <BlogDetailsPage />
          </LazyElement>
        ),
      },
      {
        path: "blogs/upsert/:id?",
        element: (
          <ProtectedRoute>
            <LazyElement>
              <UpsertBlogPage />
            </LazyElement>
          </ProtectedRoute>
        ),
      },

      // ---------------------------------------------------------
      // Reels Routes
      // ---------------------------------------------------------
      {
        path: "reels",
        element: (
          <LazyElement>
            <ReelsPage />
          </LazyElement>
        ),
      },
      {
        path: "reels/search",
        element: (
          <LazyElement>
            <SearchResultsPage />
          </LazyElement>
        ),
      },
      {
        path: "reels/video-manager",
        element: (
          <LazyElement>
            <VideoManagerPage />
          </LazyElement>
        ),
      },
    ],
  },

  // ===========================================================
  // ADMIN ROUTES (Admin Only)
  // ===========================================================
  {
    path: "admin",
    element: (
      <AdminRoute>
        <LazyElement>
          <AdminPage />
        </LazyElement>
      </AdminRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/accounts" /> },
      {
        path: "accounts",
        element: (
          <LazyElement>
            <AccountManagementPage />
          </LazyElement>
        ),
      },
      {
        path: "blogs",
        element: (
          <LazyElement>
            <BlogManagementPage />
          </LazyElement>
        ),
      },
      {
        path: "statistics",
        element: (
          <LazyElement>
            <StatisticsManagementPage />
          </LazyElement>
        ),
      },
      {
        path: "music",
        element: (
          <LazyElement>
            <MusicManagementPage />
          </LazyElement>
        ),
      },
      {
        path: "albums",
        element: (
          <LazyElement>
            <AlbumManagementPage />
          </LazyElement>
        ),
      },
      {
        path: "artists",
        element: (
          <LazyElement>
            <ArtistManagementPage />
          </LazyElement>
        ),
      },
      {
        path: "genres",
        element: (
          <LazyElement>
            <GenreManagementPage />
          </LazyElement>
        ),
      },
      {
        path: "reels",
        element: (
          <LazyElement>
            <ReelManagementPage />
          </LazyElement>
        ),
      },
    ],
  },
]);
