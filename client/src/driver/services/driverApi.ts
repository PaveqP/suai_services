import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  DriverInfoResponse,
  UpdateDriverInfoResponse,
  DriverOrderResponse,
  CarInfo,
  ShiftInfo,
  StartShiftResponse,
  EndShiftResponse,
  BaseResponse,
} from "../data-access";

export const driverApi = createApi({
  reducerPath: "driverApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/driver/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["DriverInfo", "Orders", "Cars", "Shifts"],
  endpoints: (builder) => ({
    getInfo: builder.query<DriverInfoResponse, void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["DriverInfo"],
    }),
    updateInfo: builder.mutation<BaseResponse, UpdateDriverInfoResponse>({
      query: (params: UpdateDriverInfoResponse) => ({
        url: "/update",
        method: "PATCH",
        body: params,
      }),
      invalidatesTags: ["DriverInfo"],
    }),
    getOrders: builder.query<DriverOrderResponse[], void>({
      query: () => ({
        url: "/orders",
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),
    acceptOrder: builder.mutation<BaseResponse, string>({
      query: (orderId: string) => ({
        url: `/orders/${orderId}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["Orders"],
    }),
    startTrip: builder.mutation<BaseResponse, string>({
      query: (orderId: string) => ({
        url: `/orders/${orderId}/start`,
        method: "POST",
      }),
      invalidatesTags: ["Orders"],
    }),
    completeOrder: builder.mutation<BaseResponse, string>({
      query: (orderId: string) => ({
        url: `/orders/${orderId}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["Orders"],
    }),
    getCars: builder.query<CarInfo[], void>({
      query: () => ({
        url: "/cars",
        method: "GET",
      }),
      providesTags: ["Cars"],
    }),
    addCar: builder.mutation<BaseResponse, CarInfo>({
      query: (params: CarInfo) => ({
        url: "/cars",
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["Cars"],
    }),
    getShifts: builder.query<ShiftInfo[], void>({
      query: () => ({
        url: "/shifts",
        method: "GET",
      }),
      providesTags: ["Shifts"],
    }),
    getActiveShift: builder.query<ShiftInfo | null, void>({
      query: () => ({
        url: "/shifts/active",
        method: "GET",
      }),
      providesTags: ["Shifts"],
    }),
    startShift: builder.mutation<StartShiftResponse, void>({
      query: () => ({
        url: "/shifts/start",
        method: "POST",
      }),
      invalidatesTags: ["Shifts"],
    }),
    endShift: builder.mutation<EndShiftResponse, void>({
      query: () => ({
        url: "/shifts/end",
        method: "POST",
      }),
      invalidatesTags: ["Shifts"],
    }),
  }),
});

export const {
  useGetInfoQuery,
  useUpdateInfoMutation,
  useGetOrdersQuery,
  useAcceptOrderMutation,
  useStartTripMutation,
  useCompleteOrderMutation,
  useGetCarsQuery,
  useAddCarMutation,
  useGetShiftsQuery,
  useGetActiveShiftQuery,
  useStartShiftMutation,
  useEndShiftMutation,
} = driverApi;

