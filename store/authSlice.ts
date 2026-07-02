import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootState } from './store';

export interface User {
  username: string;
  password: string;
  wins: number;
  losses: number;
  draws: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
};

const USERS_KEY = 'ttt_users';
const SESSION_KEY = 'ttt_session';

async function getUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveUsers(users: User[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const username = await AsyncStorage.getItem(SESSION_KEY);
  if (!username) return null;
  const users = await getUsers();
  return users.find(u => u.username === username) ?? null;
});

export const login = createAsyncThunk<
  User,
  { username: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ username, password }, { rejectWithValue }) => {
  const users = await getUsers();
  const found = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!found) return rejectWithValue('User not found');
  if (found.password !== password) return rejectWithValue('Wrong password');
  await AsyncStorage.setItem(SESSION_KEY, found.username);
  return found;
});

export const register = createAsyncThunk<
  User,
  { username: string; password: string },
  { rejectValue: string }
>('auth/register', async ({ username, password }, { rejectWithValue }) => {
  if (username.trim().length < 3) return rejectWithValue('Username must be at least 3 characters');
  if (password.length < 4) return rejectWithValue('Password must be at least 4 characters');
  const users = await getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return rejectWithValue('Username already taken');
  }
  const newUser: User = { username: username.trim(), password, wins: 0, losses: 0, draws: 0 };
  await saveUsers([...users, newUser]);
  await AsyncStorage.setItem(SESSION_KEY, newUser.username);
  return newUser;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
});

export const updateStats = createAsyncThunk<
  User | null,
  'win' | 'loss' | 'draw',
  { state: RootState }
>('auth/updateStats', async (result, { getState }) => {
  const { user } = getState().auth;
  if (!user) return null;
  const users = await getUsers();
  const updated = users.map(u => {
    if (u.username !== user.username) return u;
    return {
      ...u,
      wins: result === 'win' ? u.wins + 1 : u.wins,
      losses: result === 'loss' ? u.losses + 1 : u.losses,
      draws: result === 'draw' ? u.draws + 1 : u.draws,
    };
  });
  await saveUsers(updated);
  return updated.find(u => u.username === user.username) ?? null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(restoreSession.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(restoreSession.rejected, state => {
        state.isLoading = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
      })
      .addCase(updateStats.fulfilled, (state, action) => {
        if (action.payload) state.user = action.payload;
      });
  },
});

export default authSlice.reducer;
