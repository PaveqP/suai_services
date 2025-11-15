import { createSlice } from "@reduxjs/toolkit";
import type {
  OrdersListResponse,
  UserInfoResponse,
} from "../../user/data-access";
import type { PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  name: string;
  surname: string;
  lastname?: string;
  country: string;
  city: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  orders: OrdersListResponse[] | null;
};

const initialState: UserState = {
  name: "",
  surname: "",
  lastname: "",
  country: "",
  city: "",
  date_of_birth: "",
  email: "",
  phone_number: "",
  orders: null,
};

export const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfoResponse>) => {
      state.city = action.payload.city;
      state.country = action.payload.country;
      state.date_of_birth = action.payload.date_of_birth;
      state.email = action.payload.email;
      state.lastname = action.payload.lastname;
      state.name = action.payload.name;
      state.phone_number = action.payload.phone_number;
      state.surname = action.payload.surname;
    },
    setUserOrders: (state, action: PayloadAction<OrdersListResponse[]>) => {
      state.orders = action.payload;
    },
  },
});

export const { setUserInfo, setUserOrders } = userSlice.actions;
export default userSlice.reducer;
