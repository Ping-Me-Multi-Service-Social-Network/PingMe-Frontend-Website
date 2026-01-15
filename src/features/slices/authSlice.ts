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
};

const initialValue: AuthState = {
  userSession: {} as CurrentUserSessionResponse,
  isLogin: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialValue,
  reducers: {
    updateTokenManually(state, action: PayloadAction<DefaultAuthResponse>) {
      state.userSession = action.payload.userSession;
      localStorage.setItem("access_token", action.payload.accessToken);
      state.isLogin = true;
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<DefaultAuthResponse>) => {
          state.userSession = action.payload.userSession;
          localStorage.setItem("access_token", action.payload.accessToken);

          state.isLogin = true;
          state.isLoading = false;
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? null;
      })

      // LOGOUT
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.userSession = {} as CurrentUserSessionResponse;

        state.isLogin = false;
        state.isLoading = false;
        localStorage.removeItem("access_token");
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // GET CURRENT SESSION
      .addCase(getCurrentUserSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getCurrentUserSession.fulfilled,
        (state, action: PayloadAction<CurrentUserSessionResponse>) => {
          state.userSession = action.payload;

          state.isLogin = true;
          state.isLoading = false;
        }
      )
      .addCase(getCurrentUserSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// ===========================================
// EXPORT REDUCER
// ===========================================
export const { updateTokenManually } = authSlice.actions;
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
