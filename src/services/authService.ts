import type { Session } from "@supabase/supabase-js";
import { supabase } from "~/lib/supabase";
import type { Profile, UserRole } from "~/types/supabase";
import { getProfile } from "~/services/profileService";

export type AuthResult =
  | { ok: true; session: Session | null; profile: Profile | null }
  | { ok: false; message: string };

export const getCurrentSession = async (): Promise<Session | null> => {
  if (supabase === null) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error !== null) return null;

  return data.session;
};

export const signUpWithEmail = async ({
  email,
  password,
  displayName,
  role,
}: {
  email: string;
  password: string;
  displayName: string;
  role: Exclude<UserRole, "school_admin">;
}): Promise<AuthResult> => {
  if (supabase === null) {
    return { ok: false, message: "Supabase no está configurado." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        typeof window === "undefined"
          ? undefined
          : `${window.location.origin}/?login`,
      data: {
        display_name: displayName,
        role,
      },
    },
  });

  if (error !== null) return { ok: false, message: error.message };

  return {
    ok: true,
    session: data.session,
    profile: null,
  };
};

export const signInWithEmail = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthResult> => {
  if (supabase === null) {
    return { ok: false, message: "Supabase no está configurado." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error !== null) return { ok: false, message: error.message };

  return {
    ok: true,
    session: data.session,
    profile: data.user === null ? null : await getProfile(data.user.id),
  };
};

export const signOut = async (): Promise<void> => {
  if (supabase === null) return;

  await supabase.auth.signOut();
};

export const signInWithOAuthProvider = async (
  provider: "google" | "facebook",
): Promise<{ ok: true } | { ok: false; message: string }> => {
  if (supabase === null) {
    return { ok: false, message: "Supabase no está configurado." };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo:
        typeof window === "undefined" ? undefined : window.location.origin,
    },
  });

  if (error !== null) return { ok: false, message: error.message };

  return { ok: true };
};

export const sendPasswordResetEmail = async (
  email: string,
): Promise<{ ok: true } | { ok: false; message: string }> => {
  if (supabase === null) {
    return { ok: false, message: "Supabase no está configurado." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      typeof window === "undefined"
        ? undefined
        : `${window.location.origin}/?login`,
  });

  if (error !== null) return { ok: false, message: error.message };

  return { ok: true };
};
