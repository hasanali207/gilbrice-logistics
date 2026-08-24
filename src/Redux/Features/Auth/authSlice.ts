import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

/* =========================================================
   USER ROLE
========================================================= */

export type TUserRole =
  | "GILBRICE_SUPER_ADMIN"
  | "GILBRICE_ADMIN"
  | "GILBRICE_FINANCE"
  | "OWNER"
  | "MANAGER"
  | "WAREHOUSE_EMPLOYEE"
  | "CASHIER";

/* =========================================================
   USER
========================================================= */

export type TUser = {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  partnerId?: string | null;
  role: TUserRole;
  userType: "GILBRICE_STAFF" | "PARTNER_EMPLOYEE";
  bio?: string;
  subjects?: string;
  gradeLevel?: string;

  availability?: {
    from: string;
    to: string;
  };

  price?: number;
};

/* =========================================================
   AUTH STATE
========================================================= */

export type TAuthState = {
  user: TUser | null;
  token: string | null;
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState: TAuthState = {
  user: null,
  token: null,
};

/* =========================================================
   AUTH SLICE
========================================================= */

export const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    /* -----------------------------------------------------
       SET USER
    ----------------------------------------------------- */

    setUser: (
      state,
      action: PayloadAction<{
        user: TUser;
        token: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },

    /* -----------------------------------------------------
       UPDATE USER
    ----------------------------------------------------- */

    updateUser: (state, action: PayloadAction<Partial<TUser>>) => {
      if (!state.user) return;

      state.user = {
        ...state.user,
        ...action.payload,
      };
    },

    /* -----------------------------------------------------
       LOGOUT
    ----------------------------------------------------- */

    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const { setUser, updateUser, logout } = authSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default authSlice.reducer;

/* =========================================================
   SELECTORS
========================================================= */

/**
 * Current authentication token
 */
export const useCurrentToken = (state: RootState) => state.auth.token;

/**
 * Current logged-in user
 */
export const selectCurrentUser = (state: RootState) => state.auth.user;

/**
 * Current user role
 */
export const selectCurrentUserRole = (state: RootState) =>
  state.auth.user?.role ?? null;

/**
 * Authentication status
 */
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.user && state.auth.token);
