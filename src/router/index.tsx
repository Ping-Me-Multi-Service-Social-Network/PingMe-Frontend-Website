import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/pages/commons/ProtectedRoute";
import { LazyElement } from "@/components/custom/LazyElement";
import ActiveAccountVerifyOtpPage from "@/pages/app-routes-page/user-page/user-info-page/components/ActiveAccountVerifyOtpPage";

// ===========================================================
// PUBLIC PAGES
// ===========================================================
const LandingPage = lazy(
  () => import("@/pages/public-routes-page/landing-page"),
);
const RegisterPage = lazy(
  () => import("@/pages/public-routes-page/register-page"),
);

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
// APP PAGES - AI ChatBox
// ===========================================================
const AIChatBoxPage = lazy(
  () => import("@/pages/app-routes-page/ai-chatbox/index"),
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
  {
    path: "/register",
    element: (
      <LazyElement>
        <RegisterPage />
      </LazyElement>
    ),
  },
  // Redirect old mode=register query to /register
  {
    path: "/home",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/auth",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/auth/verify-otp",
    element: (
      <LazyElement>
        <ActiveAccountVerifyOtpPage />
      </LazyElement>
    ),
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
        // MessagesPage is always mounted in AppPageLayout to preserve state.
        // This route only exists so /app/chat is a valid path.
        path: "chat",
        element: null,
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
      // ---------------------------------------------------------
      // AI ChatBox Routes
      // ---------------------------------------------------------
      {
        path: "ping-ai",
        element: (
          <LazyElement>
            <AIChatBoxPage />
          </LazyElement>
        ),
      },
    ],
  },
]);
