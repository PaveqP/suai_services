import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  CreateDriverRequest,
  BaseResponse,
  TicketResponse,
  UpdateTicketRequest,
} from "../data-access";

export const stuffApi = createApi({
  reducerPath: "stuffApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/stuff",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Driver", "Tickets"],
  endpoints: (builder) => ({
    createDriver: builder.mutation<BaseResponse, CreateDriverRequest>({
      query: (params: CreateDriverRequest) => ({
        url: "/manager/driver/create",
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["Driver"],
    }),
    getTickets: builder.query<TicketResponse[], void>({
      query: () => ({
        url: "/manager/tickets",
        method: "GET",
      }),
      providesTags: ["Tickets"],
    }),
    updateTicket: builder.mutation<
      BaseResponse,
      { id: string; data: UpdateTicketRequest }
    >({
      query: ({ id, data }) => ({
        url: `/manager/tickets/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Tickets"],
    }),
  }),
});

export const {
  useCreateDriverMutation,
  useGetTicketsQuery,
  useUpdateTicketMutation,
} = stuffApi;
