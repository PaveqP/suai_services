import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  CreateOrderRequest,
  OrdersListResponse,
  UpdateUserInfoResponse,
  UserInfoResponse,
  OrderPriceResponse,
  CreateTicketRequest,
} from "../data-access";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/user/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["UserInfo"],
  endpoints: (builder) => ({
    getInfo: builder.query<UserInfoResponse, void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["UserInfo"],
    }),
    getOrderPrice: builder.query<OrderPriceResponse, string>({
      query: (filters: string) => ({
        url: "/orders/price" + "?" + filters,
        method: "GET",
      }),
    }),
    getOrders: builder.query<OrdersListResponse[], void>({
      query: () => ({
        url: "/orders",
        method: "GET",
      }),
    }),
    updateInfo: builder.mutation<unknown, UpdateUserInfoResponse>({
      query: (params: UpdateUserInfoResponse) => ({
        url: "/personal/update",
        method: "PATCH",
        body: params,
      }),
      invalidatesTags: ["UserInfo"],
    }),
    createOrder: builder.mutation<unknown, CreateOrderRequest>({
      query: (params: CreateOrderRequest) => ({
        url: "/orders/create",
        method: "POST",
        body: params,
      }),
    }),
    createTicket: builder.mutation<unknown, CreateTicketRequest>({
      query: (params: CreateTicketRequest) => ({
        url: "/tickets/create",
        method: "POST",
        body: params,
      }),
    }),
  }),
});

export const {
  useGetInfoQuery,
  useGetOrderPriceQuery,
  useGetOrdersQuery,
  useUpdateInfoMutation,
  useCreateOrderMutation,
  useCreateTicketMutation,
} = userApi;
