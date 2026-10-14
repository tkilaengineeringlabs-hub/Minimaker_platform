import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FacebookLogoSvg, GoogleLogoSvg } from "~/components/LoginScreen";
import { OtpMission } from "~/components/otp/OtpMission";
import { LanguageHeader } from "~/components/LanguageHeader";
import { useBoundStore } from "~/hooks/useBoundStore";
import { isSupabaseConfigured } from "~/lib/supabase";
import {
  signInWithOAuthProvider,
  signUpWithEmail,
} from "~/services/authService";
import type { UserRole } from "~/types/supabase";

const Register: NextPage = () => {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    const header = main?.querySelector("header");
    if (!main || !header) return;

    const updateHeaderHeight = () => {
      main.style.setProperty(
        "--register-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    };

    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const router = useRouter();
  const logIn = useBoundStore((x) => x.logIn);
  const setName = useBoundStore((x) => x.setName);
  const setUsername = useBoundStore((x) => x.setUsername);

  const [role, setRole] =
    useState<Exclude<UserRole, "school_admin">>("student");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null,
  );

  const nextRoute = role === "teacher" ? "/teacher" : "/learn";

  const submitRegistration = async () => {
    setMessage("");

    const cleanName = displayName.trim();
    const cleanEmail = email.trim();

    if (cleanName === "" || cleanEmail === "" || password === "") {
      setMessage("Completa nombre, correo y contraseña.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    if (isSupabaseConfigured) {
      setLoading(true);
      const result = await signUpWithEmail({
        email: cleanEmail,
        password,
        displayName: cleanName,
        role,
      });
      setLoading(false);

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      if (result.session === null) {
        setVerificationEmail(cleanEmail);
        return;
      }

      void router.push(nextRoute);
      return;
    }

    setName(cleanName);
    setUsername(cleanName.replace(/ +/g, "-").toLowerCase());
    logIn();
    void router.push(nextRoute);
  };

  const registerWithOAuth = async (provider: "google" | "facebook") => {
    setMessage("");

    if (!isSupabaseConfigured) {
      setMessage("Configura Supabase para registrarte con este proveedor.");
      return;
    }

    const result = await signInWithOAuthProvider(provider);
    if (!result.ok) setMessage(result.message);
  };

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-cyan-50"
      style={{ paddingTop: "var(--register-header-height, 88px)" }}
    >
      <LanguageHeader />

      {verificationEmail !== null ? (
        <div
          className="flex items-center"
          style={{
            minHeight: "calc(100svh - var(--register-header-height, 88px))",
          }}
        >
          <OtpMission
            email={verificationEmail}
            onBack={() => setVerificationEmail(null)}
          />
        </div>
      ) : (
        <section
          className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-8 px-4 py-10 md:flex-row"
          style={{
            minHeight: "calc(100svh - var(--register-header-height, 88px))",
          }}
        >
          <div className="max-w-md text-center md:text-left">
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-6xl shadow-sm md:mx-0">
              🤖
            </div>
            <h1 className="text-4xl font-black text-gray-800">
              Crea tu cuenta Maker
            </h1>
            <p className="mt-3 text-lg font-bold text-gray-500">
              Guarda tu progreso, desbloquea kits y sigue construyendo
              proyectos.
            </p>
          </div>

          <section className="w-full max-w-md rounded-3xl border-2 border-b-4 border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Alumno", value: "student" },
                { label: "Profesor", value: "teacher" },
              ].map((option) => (
                <button
                  key={option.value}
                  className={[
                    "rounded-2xl border-2 border-b-4 px-4 py-3 font-black uppercase transition",
                    role === option.value
                      ? "border-[#00838f] bg-[#00acc1] text-white"
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100",
                  ].join(" ")}
                  onClick={() =>
                    setRole(option.value as Exclude<UserRole, "school_admin">)
                  }
                >
                  Soy {option.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <input
                className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-bold text-gray-800 outline-none transition focus:border-[#00acc1] focus:bg-white"
                placeholder="Nombre"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
              <input
                className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-bold text-gray-800 outline-none transition focus:border-[#00acc1] focus:bg-white"
                placeholder="Correo electrónico"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <input
                className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-bold text-gray-800 outline-none transition focus:border-[#00acc1] focus:bg-white"
                placeholder="Contraseña"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <input
                className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-bold text-gray-800 outline-none transition focus:border-[#00acc1] focus:bg-white"
                placeholder="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            {message !== "" && (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500">
                {message}
              </p>
            )}

            <button
              className="mt-5 w-full rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-4 py-3 font-black uppercase text-white transition hover:brightness-105"
              onClick={() => void submitRegistration()}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Crear cuenta"}
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-[2px] grow bg-gray-200" />
              <span className="text-xs font-black uppercase text-gray-400">
                Correo electrónico
              </span>
              <div className="h-[2px] grow bg-gray-200" />
            </div>

            <div className="flex flex-col gap-3">
              <button
                className="flex items-center justify-center gap-3 rounded-2xl border-2 border-b-4 border-gray-200 px-4 py-3 font-black text-blue-600 transition hover:bg-gray-50"
                onClick={() => void registerWithOAuth("google")}
              >
                <GoogleLogoSvg className="h-5 w-5" />
                Registrarme con Google
              </button>
              <button
                className="flex items-center justify-center gap-3 rounded-2xl border-2 border-b-4 border-gray-200 px-4 py-3 font-black text-blue-900 transition hover:bg-gray-50"
                onClick={() => void registerWithOAuth("facebook")}
              >
                <FacebookLogoSvg className="h-5 w-5" />
                Registrarme con Facebook
              </button>
            </div>

            <p className="mt-5 text-center text-sm font-bold text-gray-500">
              ¿Ya tienes una cuenta?{" "}
              <Link className="uppercase text-[#00acc1]" href="/?login">
                Iniciar sesión
              </Link>
            </p>
          </section>
        </section>
      )}
    </main>
  );
};

export default Register;
