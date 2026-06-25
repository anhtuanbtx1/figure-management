import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuitemsType } from '@/app/(DashboardLayout)/layout/vertical/sidebar/MenuItems';

interface MenuState {
  items: MenuitemsType[];
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  items: [],
  loading: false,
  error: null,
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuItems: (state, action: PayloadAction<MenuitemsType[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setMenuItems, setLoading, setError } = menuSlice.actions;
export default menuSlice.reducer;
