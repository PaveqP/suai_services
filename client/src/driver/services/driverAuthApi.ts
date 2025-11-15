import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  AuthResponse,
  LoginRequest,
} from "../data-access";
import type { RootState } from "../../store/store";
import { logout, setCredentials } from "../../store/slices/authSlice";

export const driverAuthApi = createApi({
  reducerPath: "driverAuthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/driver/auth",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.AccessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    signIn: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials: LoginRequest) => ({
        url: "/sign-in",
        method: "POST",
        body: credentials,
      }),
      onQueryStarted: async (_credentials, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          dispatch(logout());
        }
      },
    }),
  }),
});

export const { useSignInMutation } = driverAuthApi;

