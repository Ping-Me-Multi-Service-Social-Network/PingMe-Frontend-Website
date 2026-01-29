import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/pages/commons/ProtectedRoute";
import { LazyElement } from "@/components/custom/LazyElement";

// ===========================================================
// PUBLIC PAGES
// ===========================================================
const LandingPage = lazy(() => import("@/pages/landing-page"));

// ===========================================================
// APP PAGES - Layout
// ===========================================================
const AppPageLayout = lazy(() => import("@/pages/app-routes-page"));

// ===========================================================
// APP PAGES - Profile
// ===========================================================
const ProfilePage = lazy(() => import("@/pages/app-routes-page/user-page"));
const UserInfoPage = lazy(
  () => import("@/pages/app-routes-page/user-page/user-info-page"),
);
const ChangePasswordPage = lazy(
  () => import("@/pages/app-routes-page/user-page/change-password-page"),
);
const DeviceManagementPage = lazy(
  () => import("@/pages/app-routes-page/user-page/device-management-page"),
);

// ===========================================================
// APP PAGES - Chat & Contacts
// ===========================================================
const MessagesPage = lazy(() => import("@/pages/app-routes-page/chat-page"));
const ContactsPage = lazy(() => import("@/pages/app-routes-page/contact-page"));

// ===========================================================
// APP PAGES - Music
// ===========================================================
const MusicHomePage = lazy(() => import("@/pages/app-routes-page/music-page"));
const MusicLayout = lazy(
  () =>
    import("@/pages/app-routes-page/music-page/components/layout/MusicLayout"),
);
const SongListPage = lazy(
  () =>
    import("@/pages/app-routes-page/music-page/components/pages/SongListPage"),
);
const AlbumsPage = lazy(
  () =>
    import("@/pages/app-routes-page/music-page/components/pages/AlbumsPage"),
);
const ArtistsPage = lazy(
  () =>
    import("@/pages/app-routes-page/music-page/components/pages/ArtistsPage"),
);
const RankingsPage = lazy(
  () =>
    import("@/pages/app-routes-page/music-page/components/pages/RankingsPage"),
);
const FavoritesPage = lazy(
  () =>
    import("@/pages/app-routes-page/music-page/components/pages/FavoritesPage"),
);
const PlaylistsPage = lazy(
  () =>
    import("@/pages/app-routes-page/music-page/components/pages/PlaylistsPage"),
);
const PlaylistDetailPage = lazy(
  () =>
    import("@/pages/app-routes-page/music-page/components/pages/PlaylistDetailPage"),
);
const DiscoverPlaylistsPage = lazy(
  () =>
    import("@/pages/app-routes-page/music-page/components/pages/DiscoverPlaylistsPage"),
);

// ===========================================================
// APP PAGES - Blogs
// ===========================================================
const BlogPage = lazy(() => import("@/pages/app-routes-page/blog-page"));
const BlogDetailsPage = lazy(
  () => import("@/pages/app-routes-page/blog-page/blog-details-page"),
);
const UpsertBlogPage = lazy(
  () => import("@/pages/app-routes-page/blog-page/upsert-blog-page"),
);

// ===========================================================
// APP PAGES - Reels
// ===========================================================
const ReelsPage = lazy(() => import("@/pages/app-routes-page/reels-page"));
const VideoManagerPage = lazy(
  () => import("@/pages/app-routes-page/reels-page/video-manager"),
);
const SearchResultsPage = lazy(
  () => import("@/pages/app-routes-page/reels-page/search-results"),
);
// ===========================================================
// FORGET PASSWORD PAGES
// ===========================================================

const EmailInputPage = lazy(
  () =>
    import("@/pages/public-routes-page/forget-password-page/components/EmailInputPage"),
);
const VerifyOtpPage = lazy(
  () =>
    import("@/pages/public-routes-page/forget-password-page/components/VerifyOtpPage"),
);
const ResetPasswordPage = lazy(
  () =>
    import("@/pages/public-routes-page/forget-password-page/components/ResetPasswordPage"),
);
const ForgetPasswordPage = lazy(
  () => import("@/pages/public-routes-page/forget-password-page"),
);
export const router = createBrowserRouter([
  // ===========================================================
  // PUBLIC ROUTES - Single Landing Page
  // ===========================================================
  {
    path: "/",
    element: (
      <LazyElement>
        <LandingPage />
      </LazyElement>
    ),
  },
  // Redirect old routes to landing page
  {
    path: "/home",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/auth",
    element: <Navigate to="/" replace />,
  },
  {
    path: "forgot-password",
    element: (
      <LazyElement>
        <ForgetPasswordPage />
      </LazyElement>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="email" replace />,
      },
      {
        path: "email",
        element: (
          <LazyElement>
            <EmailInputPage />
          </LazyElement>
        ),
      },
      {
        path: "verify-otp",
        element: (
          <LazyElement>
            <VerifyOtpPage />
          </LazyElement>
        ),
      },
      {
        path: "reset-password",
        element: (
          <LazyElement>
            <ResetPasswordPage />
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
      // Default redirect to chat
      { index: true, element: <Navigate to="/app/chat" replace /> },

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
                <MusicHomePage />
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
]);
