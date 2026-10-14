import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { LanguageHeader } from "~/components/LanguageHeader";
import { sendPasswordResetEmail } from "~/services/authService";

const ForgotPassword: NextPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const result = await sendPasswordResetEmail(email);
    setLoading(false);

    if (result.ok) {
      setIsSuccess(true);
      setMessage("Correo enviado. Revisa tu bandeja de entrada.");
      return;
    }

    setIsSuccess(false);
    setMessage("Error al enviar el correo. Inténtalo nuevamente.");
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#235390] text-white">
      <LanguageHeader />
      <section className="flex w-full grow items-center justify-center px-5 py-28">
        <div className="w-full max-w-md rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-7 text-center text-gray-800 shadow-xl">
          <div className="text-6xl">🔐</div>
          <h1 className="mt-4 text-3xl font-black">Recupera tu contraseña</h1>
          <p className="mt-3 font-medium text-gray-500">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecerla.
          </p>

          <div className="mt-6 flex flex-col gap-3 text-left">
            <label className="grid gap-2 font-bold text-gray-700">
              Correo electrónico
              <input
                className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#00acc1]"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <button
              className="w-full rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] py-3 font-black uppercase text-white transition hover:brightness-110 disabled:opacity-60"
              onClick={() => void submit()}
              disabled={loading || email.trim() === ""}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </div>

          {message !== "" && (
            <p
              className={[
                "mt-4 rounded-2xl px-4 py-3 font-bold",
                isSuccess
                  ? "bg-cyan-50 text-[#00838f]"
                  : "bg-red-50 text-red-500",
              ].join(" ")}
            >
              {message}
            </p>
          )}

          <Link
            href="/?login"
            className="mt-6 inline-flex font-black uppercase text-[#00acc1]"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;
