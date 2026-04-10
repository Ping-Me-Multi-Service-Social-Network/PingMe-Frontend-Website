import type {
  DefaultAuthResponse,
  CurrentUserSessionResponse,
} from "@/types/authentication";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getCurrentUserSession, login, logout } from "./authThunk";

export type AuthState = {
  userSession: CurrentUserSessionResponse;
  isLogin: boolean;
  isLoading: boolean;
  error: string | null;
  logoutReason: "MANUAL" | "EXPIRED" | null;
};

const initialValue: AuthState = {
  userSession: {} as CurrentUserSessionResponse,
  isLogin: false,
  isLoading: false,
  error: null,
  logoutReason: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialValue,
  reducers: {
    updateUserSession(state, action: PayloadAction<DefaultAuthResponse>) {
      state.userSession = action.payload.userSession;
    },

    clearAuthState(state) {
      state.userSession = {} as CurrentUserSessionResponse;
      state.isLogin = false;
      state.isLoading = false;
      state.error = null;
    },

    setLogoutReason(state, action: PayloadAction<AuthState["logoutReason"]>) {
      state.logoutReason = action.payload;
    },

    updateUserAvatarUrl(state, action: PayloadAction<string>) {
      if (state.userSession) {
        state.userSession.avatarUrl = action.payload;
      }
    },
  },

  extraReducers: (builder) => {
    // ================
    // LOGIN
    // ================

    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(
      login.fulfilled,
      (state, action: PayloadAction<DefaultAuthResponse>) => {
        state.userSession = action.payload.userSession;

        state.isLogin = true;
        state.isLoading = false;
      },
    );

    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // ================
    // LOGOUT
    // ================
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(logout.fulfilled, (state) => {
      state.userSession = {} as CurrentUserSessionResponse;

      state.isLogin = false;
      state.isLoading = false;
    });

    builder.addCase(logout.rejected, (state, action) => {
      state.userSession = {} as CurrentUserSessionResponse;

      state.isLogin = false;
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // ================
    // GET CURRENT SESSION
    // ================
    builder.addCase(getCurrentUserSession.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(
      getCurrentUserSession.fulfilled,
      (state, action: PayloadAction<CurrentUserSessionResponse>) => {
        const prevUrl = state.userSession?.avatarUrl;
        let newUrl = action.payload.avatarUrl;

        // Maintain cache-busted avatar URL across session re-fetches
        if (prevUrl && newUrl) {
          const prevBase = prevUrl.split("?v=")[0];
          if (prevBase === newUrl && prevUrl.includes("?v=")) {
            newUrl = prevUrl;
          }
        }

        state.userSession = {
          ...action.payload,
          avatarUrl: newUrl,
        };

        state.isLogin = true;
        state.isLoading = false;
      },
    );

    builder.addCase(getCurrentUserSession.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// ===========================================
// EXPORT REDUCER
// ===========================================
export const { updateUserSession, clearAuthState, setLogoutReason, updateUserAvatarUrl } =
  authSlice.actions;
export default authSlice.reducer;

// ===========================================
// SELECTORS
// ===========================================
export const selectUser = (state: { auth: AuthState }) =>
  state.auth.userSession;
export const selectIsLogin = (state: { auth: AuthState }) => state.auth.isLogin;

export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
