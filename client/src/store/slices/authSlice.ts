import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthResponse } from "../../user/data-access";

interface AuthState {
  AccessToken: string | null;
  RefreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  AccessToken: null,
  RefreshToken: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      const { AccessToken, RefreshToken } = action.payload;
      state.AccessToken = AccessToken;
      state.RefreshToken = RefreshToken;
      state.isAuthenticated = true;
      localStorage.setItem("access_token", AccessToken);
      localStorage.setItem("refresh_token", RefreshToken);
    },
    logout: (state) => {
      state.AccessToken = null;
      state.RefreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
