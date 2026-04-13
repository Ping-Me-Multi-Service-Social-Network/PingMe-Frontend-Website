import { loginLocalApi, logoutApi } from "@/services/authentication";
import type {
  DefaultAuthResponse,
  DefaultLoginRequest,
  CurrentUserSessionResponse,
} from "@/types/authentication";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { getCurrentUserSessionApi } from "@/services/user/currentUserProfileApi.ts";
import i18n from "@/i18n";

// =========================================================
// THUNK LOGIN
// =========================================================
export const login = createAsyncThunk<
  DefaultAuthResponse,
  DefaultLoginRequest,
  { rejectValue: string }
>("auth/login", async (data, thunkAPI) => {
  try {
    const res = await loginLocalApi(data);
    localStorage.setItem("access_token", res.data.data.accessToken);
    toast.success(i18n.t("auth.login.success", { ns: "landing" }));
    return res.data.data;
  } catch (err: unknown) {
    const errObj = err as any;
    if (errObj?.response?.data?.errorMessage === "REQUIRE_ACTIVATION") {
      return thunkAPI.rejectWithValue("REQUIRE_ACTIVATION");
    }

    const message = getErrorMessage(
      err,
      i18n.t("auth.login.fail", { ns: "landing" }),
    );
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

// =========================================================
// THUNK LOGOUT
// =========================================================
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await logoutApi();
    localStorage.removeItem("access_token");
    toast.success(i18n.t("auth.logout.success", { ns: "landing" }));
  } catch (err: unknown) {
    const message = getErrorMessage(
      err,
      i18n.t("auth.logout.fail", { ns: "landing" }),
    );
    return thunkAPI.rejectWithValue(message);
  }
});

// =========================================================
// THUNK GET CURRENT USER SESSION
// =========================================================
export const getCurrentUserSession = createAsyncThunk<
  CurrentUserSessionResponse,
  void,
  { rejectValue: string }
>("auth/me", async (_, thunkAPI) => {
  try {
    const res = await getCurrentUserSessionApi();
    return res.data.data;
  } catch (err: unknown) {
    const message = getErrorMessage(
      err,
      i18n.t("errors.sessionFail", { ns: "common" }),
    );
    return thunkAPI.rejectWithValue(message);
  }
});
