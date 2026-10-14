import dayjs from "dayjs";
import type { BoundStateCreator } from "~/hooks/useBoundStore";
import type { UserRole } from "~/types/supabase";

export type UserSlice = {
  supabaseUserId: string | null;
  email: string;
  name: string;
  username: string;
  role: UserRole;
  joinedAt: dayjs.Dayjs;
  loggedIn: boolean;
  setSupabaseUser: (user: {
    id: string | null;
    email?: string;
    role?: UserRole;
  }) => void;
  setName: (name: string) => void;
  setUsername: (username: string) => void;
  logIn: () => void;
  logOut: () => void;
};

export const createUserSlice: BoundStateCreator<UserSlice> = (set) => ({
  supabaseUserId: null,
  email: "",
  name: "",
  username: "",
  role: "student",
  joinedAt: dayjs(),
  loggedIn: false,
  setSupabaseUser: ({ id, email = "", role = "student" }) =>
    set(() => ({ supabaseUserId: id, email, role })),
  setName: (name: string) => set(() => ({ name })),
  setUsername: (username: string) => set(() => ({ username })),
  logIn: () => set(() => ({ loggedIn: true })),
  logOut: () =>
    set(() => ({
      loggedIn: false,
      supabaseUserId: null,
      email: "",
      role: "student",
    })),
});
