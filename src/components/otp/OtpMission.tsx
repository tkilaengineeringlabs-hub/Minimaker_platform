import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { resendSignupOtp, verifySignupOtp } from "~/services/otpService";
import { OtpRobot, type RobotMood } from "./OtpRobot";
import styles from "./OtpMission.module.css";

type MissionState = "waiting" | "typing" | "verifying" | "error" | "success";
const emptyDigits = () => Array<string>(6).fill("");

export const OtpMission = ({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) => {
  const router = useRouter();
  const [digits, setDigits] = useState(emptyDigits);
  const [state, setState] = useState<MissionState>("waiting");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resendAfter, setResendAfter] = useState(() => Date.now() + 60000);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const busy = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    inputs.current[0]?.focus();
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.ceil((resendAfter - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [resendAfter]);

  useEffect(() => {
    if (state !== "success") return;
    const timer = setTimeout(() => {
      void router.push("/learn");
    }, 1400);
    return () => clearTimeout(timer);
  }, [state, router]);

  const updateDigits = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    const start = clean.length === 6 ? 0 : index;
    const next = [...digits];
    if (clean === "") next[index] = "";
    else
      clean.split("").forEach((digit, offset) => {
        if (start + offset < 6) next[start + offset] = digit;
      });
    setDigits(next);
    setState(next.some(Boolean) ? "typing" : "waiting");
    setMessage("");
    if (clean !== "")
      inputs.current[Math.min(start + clean.length, 5)]?.focus();
  };

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current || state === "success") return;
    if (digits.some((digit) => digit === "")) {
      setMessage(
        "Te faltan dígitos. Completa las seis celdas para abrir el acceso.",
      );
      inputs.current[digits.findIndex((digit) => digit === "")]?.focus();
      return;
    }
    busy.current = true;
    setState("verifying");
    setMessage("");
    const result = await verifySignupOtp(email, digits.join(""));
    busy.current = false;
    if (!mounted.current) return;
    setState(result.ok ? "success" : "error");
    if (!result.ok) {
      setMessage(result.message);
      inputs.current[0]?.focus();
      inputs.current[0]?.select();
    }
  };

  const resend = async () => {
    if (busy.current || secondsLeft > 0 || state === "success") return;
    busy.current = true;
    setResending(true);
    setMessage("");
    const result = await resendSignupOtp(email);
    busy.current = false;
    if (!mounted.current) return;
    setResending(false);
    if (result.ok) {
      setDigits(emptyDigits());
      setState("waiting");
      setMessage("Nuevo correo enviado. Usa el código más reciente.");
      setResendAfter(Date.now() + 60000);
      inputs.current[0]?.focus();
    } else {
      setMessage(result.message);
      setResendAfter(Date.now() + 60000);
    }
  };

  const mood: RobotMood =
    state === "success"
      ? "happy"
      : state === "error"
        ? "confused"
        : state === "typing" || state === "verifying"
          ? "scanning"
          : "waiting";
  const locked = state === "verifying" || state === "success" || resending;

  return (
    <section
      aria-labelledby="otp-title"
      className={`${styles.mission} mx-auto grid w-full max-w-4xl items-center gap-6 px-4 py-8 text-[#102a36] sm:px-8 sm:py-12 md:grid-cols-[0.8fr_1.2fr] md:gap-12`}
    >
      <div className="flex flex-col items-center">
        <span className="border border-[#00acc1]/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
          Misión 01 / Activar acceso
        </span>
        <div className="w-44 sm:w-56 md:w-full">
          <OtpRobot mood={mood} />
        </div>
        <div
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          aria-hidden="true"
        >
          <span className="h-2 w-2 bg-[#00acc1]" />
          {state === "success"
            ? "Acceso desbloqueado"
            : state === "error"
              ? "Código por revisar"
              : mood === "scanning"
                ? "Escaneando señal"
                : "Esperando señal"}
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#00838f]">
          Tu primera misión maker
        </p>
        <h1
          id="otp-title"
          className={`${styles.title} text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.95]`}
        >
          {state === "success"
            ? "¡Acceso concedido, Maker!"
            : "¡Ey Maker! Encontré un código secreto en tu correo."}
        </h1>
        <p className="mt-5 text-sm leading-6 text-[#526571]">
          Enviamos tu correo de verificación a:
        </p>
        <p className="break-all text-base font-bold text-[#00838f]">{email}</p>

        <form
          onSubmit={(event) => void verify(event)}
          className="mt-6"
          aria-busy={locked}
        >
          <fieldset disabled={locked} aria-describedby="otp-hint otp-feedback">
            <legend className="mb-3 text-sm font-bold">
              Introduce tu código de 6 dígitos
            </legend>
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Dígito ${index + 1} de 6`}
                  aria-invalid={state === "error"}
                  value={digit}
                  maxLength={6}
                  onFocus={(event) => event.currentTarget.select()}
                  onChange={(event) => updateDigits(index, event.target.value)}
                  onPaste={(event) => {
                    event.preventDefault();
                    updateDigits(index, event.clipboardData.getData("text"));
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Backspace" &&
                      digit === "" &&
                      index > 0
                    ) {
                      event.preventDefault();
                      updateDigits(index - 1, "");
                      inputs.current[index - 1]?.focus();
                    }
                    if (
                      event.key === "ArrowLeft" ||
                      event.key === "ArrowRight"
                    ) {
                      event.preventDefault();
                      inputs.current[
                        Math.max(
                          0,
                          Math.min(
                            5,
                            index + (event.key === "ArrowLeft" ? -1 : 1),
                          ),
                        )
                      ]?.focus();
                    }
                  }}
                  className={`h-14 w-full min-w-0 rounded-lg border-2 bg-white text-center font-mono text-2xl font-bold outline-none transition focus:border-[#00838f] focus:ring-4 focus:ring-[#00acc1]/15 disabled:opacity-70 sm:h-16 sm:text-3xl ${state === "error" ? "border-red-400" : state === "success" ? "border-[#00acc1] bg-[#e0f7f7]" : "border-[#102a36]/20"}`}
                />
              ))}
            </div>
          </fieldset>
          <p id="otp-hint" className="mt-3 text-xs leading-5 text-[#526571]">
            Puedes pegar el código completo. Revisa también spam.
          </p>
          <div
            id="otp-feedback"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`flex min-h-14 items-center py-3 text-sm leading-5 ${state === "error" ? "text-red-700" : "text-[#00838f]"}`}
          >
            {state === "success"
              ? "¡Misión cumplida! Abriendo tu taller…"
              : state === "verifying"
                ? "Comprobando tu código secreto…"
                : message}
          </div>
          <button
            type="submit"
            disabled={locked}
            className="w-full rounded-lg border-2 border-b-4 border-[#102a36] bg-[#08d9d6] px-4 py-4 text-sm font-black tracking-wider transition hover:bg-[#55ece9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00838f] disabled:cursor-default disabled:opacity-60"
          >
            VERIFICAR CÓDIGO
          </button>
          {state === "success" ? (
            <Link
              href="/learn"
              className="mt-4 block py-3 text-center text-sm font-bold text-[#00838f]"
            >
              IR AL TALLER
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void resend()}
                disabled={locked || secondsLeft > 0}
                className="mt-3 w-full rounded-lg border-2 border-[#102a36]/15 px-4 py-3 text-sm font-bold tracking-wider transition hover:border-[#00838f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00838f] disabled:opacity-50"
              >
                {resending ? "REENVIANDO…" : "REENVIAR CÓDIGO"}
              </button>
              <p className="mt-2 min-h-5 text-center text-xs text-[#526571]">
                {secondsLeft > 0
                  ? `Podrás reenviar en ${secondsLeft} s`
                  : "¿No llegó? Pide un nuevo correo."}
              </p>
              <button
                type="button"
                onClick={onBack}
                disabled={locked}
                className="mx-auto mt-3 block px-3 py-2 text-xs font-bold text-[#526571] underline underline-offset-4 disabled:opacity-50"
              >
                Cambiar correo
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
};
