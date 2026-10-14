import { supabase } from "~/lib/supabase";

type OtpResult = { ok: true } | { ok: false; message: string };

export const verifySignupOtp = async (
  email: string,
  token: string,
): Promise<OtpResult> => {
  if (!/^\d{6}$/.test(token)) {
    return { ok: false, message: "Introduce los seis dígitos del código." };
  }
  if (supabase === null) {
    return { ok: false, message: "No pudimos conectar. Inténtalo de nuevo." };
  }
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error !== null) {
      return {
        ok: false,
        message:
          error.status === 429
            ? "Demasiados intentos. Espera un momento antes de volver a probar."
            : error.code === "otp_expired" || error.status === 403
              ? "Ese código no es válido o ha caducado. Revísalo o pide uno nuevo."
              : "No pudimos verificar el código. Inténtalo de nuevo.",
      };
    }
    if (data.session === null) {
      return {
        ok: false,
        message: "No pudimos abrir tu sesión. Pide un código nuevo.",
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.",
    };
  }
};

export const resendSignupOtp = async (email: string): Promise<OtpResult> => {
  if (supabase === null) {
    return { ok: false, message: "No pudimos conectar. Inténtalo de nuevo." };
  }
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo:
          typeof window === "undefined"
            ? undefined
            : `${window.location.origin}/?login`,
      },
    });
    return error === null
      ? { ok: true }
      : {
          ok: false,
          message:
            error.status === 429
              ? "Espera un momento antes de pedir otro código."
              : "No pudimos reenviar el correo. Inténtalo de nuevo.",
        };
  } catch {
    return {
      ok: false,
      message: "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.",
    };
  }
};
