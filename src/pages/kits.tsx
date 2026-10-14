import { useUnlockedKits } from "~/hooks/useUnlockedKits";
import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { TopBar } from "~/components/TopBar";
import { useBoundStore } from "~/hooks/useBoundStore";
import {
  kits as kitData,
  isKitUnlocked,
  roverStorageKey,
  roverUnlockCode,
  type KitData,
} from "~/utils/kits";
import { getLearningPathById } from "~/utils/learningPaths";
import { isSupabaseConfigured } from "~/lib/supabase";
import { saveUnlockedKit } from "~/services/kitService";

type KitStatus = "EN PROGRESO" | "DISPONIBLE" | "BLOQUEADO";

type UserKit = KitData & {
  progress: number;
  status: KitStatus;
};

const Kits: NextPage = () => {
  const { unlockedKitIds, refreshLocalKits } = useUnlockedKits();
  const [unlockModalShown, setUnlockModalShown] = useState(false);
  const lessonsCompletedForPath = useBoundStore(
    (x) => x.lessonsCompletedForPath,
  );
  const supabaseUserId = useBoundStore((x) => x.supabaseUserId);

  const kits: UserKit[] = kitData.map((kit) => {
    const learningPath = getLearningPathById(kit.learningPathId);
    const totalLessons =
      learningPath?.units.reduce(
        (total, unit) => total + unit.tiles.length * 4,
        0,
      ) ?? 1;
    const lessonsCompleted = lessonsCompletedForPath(kit.learningPathId);
    const progress = Math.min(
      100,
      Math.max(
        isSupabaseConfigured ? 0 : kit.defaultProgress,
        Math.round((lessonsCompleted / totalLessons) * 100),
      ),
    );
    const unlocked = isKitUnlocked(kit, unlockedKitIds);

    return {
      ...kit,
      progress,
      status:
        kit.id === "fundamentos-maker"
          ? "EN PROGRESO"
          : unlocked
            ? "DISPONIBLE"
            : "BLOQUEADO",
    };
  });

  const unlockRover = async (): Promise<boolean> => {
    if (isSupabaseConfigured) {
      if (supabaseUserId === null) return false;
      const saved = await saveUnlockedKit({
        userId: supabaseUserId,
        kitId: "rover-bot",
      });
      if (!saved || useBoundStore.getState().supabaseUserId !== supabaseUserId)
        return false;
      useBoundStore
        .getState()
        .setUnlockedKitIds([
          ...new Set([
            ...useBoundStore.getState().unlockedKitIds,
            "rover-bot" as const,
          ]),
        ]);
      return true;
    }
    localStorage.setItem(roverStorageKey, "true");
    refreshLocalKits();
    return true;
  };

  return (
    <div>
      <TopBar backgroundColor="bg-[#00acc1]" borderColor="border-[#00838f]" />
      <LeftBar selectedTab="KITS" />

      <div className="flex justify-center gap-3 pt-14 sm:p-6 sm:pt-10 md:ml-24 lg:ml-64 lg:gap-12">
        <main className="flex max-w-2xl grow flex-col px-4 pb-28 sm:px-0">
          <header className="flex flex-col gap-4 border-b-2 border-gray-200 py-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Mis Kits</h1>
              <p className="mt-2 text-lg font-medium text-gray-500">
                Construye, aprende y completa nuevos proyectos.
              </p>
            </div>
            <button
              className="w-full rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-5 py-3 font-bold uppercase text-white transition hover:brightness-105 sm:w-fit"
              onClick={() => setUnlockModalShown(true)}
            >
              Agregar kit
            </button>
          </header>

          <section className="grid gap-5 py-6">
            {kits.map((kit) => (
              <KitCard
                key={kit.id}
                kit={kit}
                onUnlock={() => setUnlockModalShown(true)}
              />
            ))}
          </section>
        </main>

        <RightBar />
      </div>

      <BottomBar selectedTab="KITS" />
      <UnlockKitModal
        isShown={unlockModalShown}
        roverUnlocked={unlockedKitIds.has("rover-bot")}
        onClose={() => setUnlockModalShown(false)}
        onUnlock={unlockRover}
      />
    </div>
  );
};

export default Kits;

const KitCard = ({ kit, onUnlock }: { kit: UserKit; onUnlock: () => void }) => {
  const isLocked = kit.status === "BLOQUEADO";
  const canContinue =
    kit.status === "EN PROGRESO" || kit.status === "DISPONIBLE";

  return (
    <article className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-5xl">
          {kit.emoji}
        </div>

        <div className="flex grow flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{kit.name}</h2>
              <p className="mt-1 font-medium text-gray-500">
                {kit.description}
              </p>
            </div>
            <span
              className={
                isLocked
                  ? "w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-400"
                  : "w-fit rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase text-[#00838f]"
              }
            >
              {kit.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <KitMeta label="Edad" value={kit.age} />
            <KitMeta label="Dificultad" value={kit.difficulty} />
            <KitMeta label="Progreso" value={`${kit.progress}%`} />
          </div>

          <div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-[#00acc1] transition-all"
                style={{ width: `${kit.progress}%` }}
              ></div>
            </div>
          </div>

          {canContinue ? (
            <Link
              className="flex w-full items-center justify-center rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-4 py-3 font-bold uppercase text-white transition hover:brightness-105 sm:w-fit sm:min-w-[160px]"
              href={`/learn?path=${kit.learningPathId}`}
            >
              Continuar
            </Link>
          ) : (
            <button
              className="w-full rounded-2xl border-2 border-b-4 border-gray-300 bg-white px-4 py-3 font-bold uppercase text-gray-400 transition hover:bg-gray-50 sm:w-fit sm:min-w-[160px]"
              onClick={onUnlock}
            >
              Desbloquear
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const KitMeta = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border-2 border-gray-200 px-3 py-2">
      <div className="text-xs font-bold uppercase text-gray-400">{label}</div>
      <div className="font-bold text-gray-700">{value}</div>
    </div>
  );
};

const UnlockKitModal = ({
  isShown,
  roverUnlocked,
  onClose,
  onUnlock,
}: {
  isShown: boolean;
  roverUnlocked: boolean;
  onClose: () => void;
  onUnlock: () => Promise<boolean>;
}) => {
  const [kitCode, setKitCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isShown) return;

    setKitCode("");
    setIsSuccess(roverUnlocked);
    setMessage(roverUnlocked ? "¡Rover Bot desbloqueado!" : "");
  }, [isShown, roverUnlocked]);

  const submitCode = async () => {
    if (kitCode.trim() === roverUnlockCode) {
      if (!(await onUnlock())) {
        setMessage(
          "No se pudo desbloquear el kit. Inicia sesión e inténtalo de nuevo.",
        );
        return;
      }
      setIsSuccess(true);
      setMessage("¡Rover Bot desbloqueado!");
      return;
    }

    setIsSuccess(false);
    setMessage("Código no válido. Revisa el código e inténtalo de nuevo.");
  };

  return (
    <div
      className={[
        "fixed inset-0 z-40 flex items-end justify-center p-4 transition sm:items-center",
        isShown ? "" : "pointer-events-none opacity-0",
      ].join(" ")}
      aria-hidden={!isShown}
    >
      <button
        className={[
          "absolute inset-0 bg-black transition",
          isShown ? "opacity-50" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-label="Cerrar modal"
      ></button>
      <section className="relative flex w-full max-w-md flex-col gap-5 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Agregar nuevo Kit
            </h2>
            <p className="mt-2 font-medium text-gray-500">
              Ingresa el código incluido en tu caja Mini Maker.
            </p>
          </div>
          <button
            className="rounded-full px-2 text-2xl font-bold text-gray-400 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <label className="flex flex-col gap-2 font-bold text-gray-700">
          Código del kit
          <input
            className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-medium uppercase text-gray-800 outline-none transition focus:border-[#00acc1] focus:bg-white"
            placeholder="MM-ROVER-001"
            value={kitCode}
            onChange={(event) => setKitCode(event.target.value.toUpperCase())}
          />
        </label>

        {message !== "" && (
          <p
            className={
              isSuccess
                ? "rounded-xl bg-lime-100 px-4 py-3 font-bold text-green-600"
                : "rounded-xl bg-red-100 px-4 py-3 font-bold text-red-500"
            }
          >
            {message}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl px-4 py-3 font-bold uppercase text-gray-400 transition hover:bg-gray-100"
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            className="rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-4 py-3 font-bold uppercase text-white transition hover:brightness-105"
            onClick={() => void submitCode()}
          >
            Desbloquear
          </button>
        </div>
      </section>
    </div>
  );
};
