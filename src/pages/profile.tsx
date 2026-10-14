import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { SettingsGearSvg } from "~/components/Svgs";
import { useBoundStore } from "~/hooks/useBoundStore";
import {
  isKitUnlocked,
  kits as kitData,
  readUnlockedKitIds,
  type KitData,
} from "~/utils/kits";
import {
  getLearningPathById,
  learningPaths,
  type LearningPath,
} from "~/utils/learningPaths";
import { getMakerLevel } from "~/utils/makerLevel";
import { joinClassroomByCode } from "~/services/classroomService";

const lessonsPerTile = 4;

type KitProfileData = KitData & {
  progress: number;
  status: "EN PROGRESO" | "COMPLETADO";
};

type Achievement = {
  emoji: string;
  name: string;
  description: string;
  unlocked: boolean;
};

const getTotalLessonsForPath = (learningPath: LearningPath): number =>
  learningPath.units.reduce(
    (total, unit) => total + unit.tiles.length * lessonsPerTile,
    0,
  );

const getCompletedTrophyCount = (
  learningPath: LearningPath,
  lessonsCompleted: number,
): number => {
  const completedTiles = Math.floor(lessonsCompleted / lessonsPerTile);

  return learningPath.units
    .flatMap((unit) => unit.tiles)
    .filter((tile, index) => tile.type === "trophy" && index < completedTiles)
    .length;
};

const Profile: NextPage = () => {
  const loggedIn = useBoundStore((x) => x.loggedIn);
  const name = useBoundStore((x) => x.name);
  const username = useBoundStore((x) => x.username);
  const supabaseUserId = useBoundStore((x) => x.supabaseUserId);
  const streak = useBoundStore((x) => x.streak);
  const role = useBoundStore((x) => x.role);
  const xpByDate = useBoundStore((x) => x.xpByDate);
  const progressByPath = useBoundStore((x) => x.progressByPath);
  const [unlockedKitIds, setUnlockedKitIds] = useState(readUnlockedKitIds);

  useEffect(() => {
    setUnlockedKitIds(readUnlockedKitIds());
  }, [supabaseUserId]);

  const totalXp = useMemo(
    () => Object.values(xpByDate).reduce((total, xp) => total + xp, 0),
    [xpByDate],
  );
  const makerLevel = getMakerLevel(totalXp);
  const displayName = name.trim() || "Maker";
  const avatarInitial = (username.trim() || displayName)
    .charAt(0)
    .toUpperCase();

  const unlockedKits = kitData
    .filter((kit) => isKitUnlocked(kit, unlockedKitIds))
    .map((kit): KitProfileData => {
      const learningPath = getLearningPathById(kit.learningPathId);
      const totalLessons =
        learningPath !== undefined ? getTotalLessonsForPath(learningPath) : 1;
      const lessonsCompleted = progressByPath[kit.learningPathId] ?? 0;
      const progress = Math.min(
        100,
        Math.max(
          kit.defaultProgress,
          Math.round((lessonsCompleted / totalLessons) * 100),
        ),
      );

      return {
        ...kit,
        progress,
        status: progress >= 100 ? "COMPLETADO" : "EN PROGRESO",
      };
    });

  const totalLessonsCompleted = Object.values(progressByPath).reduce(
    (total, completed) => total + completed,
    0,
  );
  const completedProjects = learningPaths.reduce(
    (total, learningPath) =>
      total +
      getCompletedTrophyCount(
        learningPath,
        progressByPath[learningPath.id] ?? 0,
      ),
    0,
  );
  const roverUnlocked = unlockedKitIds.has("rover-bot");
  const ledLessonCompleted = (progressByPath.fundamentos ?? 0) >= 17;

  const achievements: Achievement[] = [
    {
      emoji: "🔧",
      name: "Primer Paso",
      description: "Completa tu primera lección.",
      unlocked: totalLessonsCompleted >= 1,
    },
    {
      emoji: "💡",
      name: "Circuito Vivo",
      description: "Completa la lección del LED.",
      unlocked: ledLessonCompleted,
    },
    {
      emoji: "🤖",
      name: "Constructor",
      description: "Desbloquea Rover Bot.",
      unlocked: roverUnlocked,
    },
    {
      emoji: "🔥",
      name: "En Racha",
      description: "Mantén una racha de 3 días.",
      unlocked: streak >= 3,
    },
    {
      emoji: "🏆",
      name: "Primer Proyecto",
      description: "Completa tu primer nodo tipo trophy.",
      unlocked: completedProjects >= 1,
    },
    {
      emoji: "🧠",
      name: "Inventor",
      description: "Alcanza 250 XP.",
      unlocked: totalXp >= 250,
    },
  ];

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 text-center">
        <div className="flex max-w-md flex-col items-center gap-5 rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-8">
          <div className="text-6xl">🛠️</div>
          <h1 className="text-3xl font-bold text-gray-800">Mi Perfil Maker</h1>
          <p className="text-lg font-medium text-gray-500">
            Inicia sesión para ver tu nivel, XP, kits y logros.
          </p>
          <Link
            href="/"
            className="rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-8 py-3 font-bold uppercase text-white transition hover:brightness-105"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ProfileTopBar />
      <LeftBar selectedTab="PERFIL" />

      <div className="flex justify-center gap-3 pt-14 md:ml-24 lg:ml-64 lg:gap-12">
        <main className="flex w-full max-w-4xl flex-col gap-7 px-4 py-6 pb-28 sm:px-6">
          <ProfileHero
            avatarInitial={avatarInitial}
            displayName={displayName}
            makerLevel={makerLevel}
            totalXp={totalXp}
            streak={streak}
          />

          <TeacherModeLink />
          {role === "school_admin" && <SchoolModeLink />}
          <div id="escuelas-maker">
            <JoinClassSection />
          </div>

          <StatsSection
            totalXp={totalXp}
            streak={streak}
            unlockedKitsCount={unlockedKits.length}
            completedProjects={completedProjects}
          />

          <MyKitsSection kits={unlockedKits} />
          <AchievementsSection achievements={achievements} />
        </main>
      </div>

      <BottomBar selectedTab="PERFIL" />
    </div>
  );
};

export default Profile;

const ProfileTopBar = () => {
  return (
    <div className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between border-b-2 border-gray-200 bg-white px-5 text-xl font-bold text-gray-300 md:hidden">
      <div className="invisible" aria-hidden={true}>
        <SettingsGearSvg />
      </div>
      <span className="text-gray-700">Mi Perfil Maker</span>
      <Link href="/settings/account">
        <SettingsGearSvg />
        <span className="sr-only">Configuración</span>
      </Link>
    </div>
  );
};

const ProfileHero = ({
  avatarInitial,
  displayName,
  makerLevel,
  totalXp,
  streak,
}: {
  avatarInitial: string;
  displayName: string;
  makerLevel: ReturnType<typeof getMakerLevel>;
  totalXp: number;
  streak: number;
}) => {
  const xpGoal = makerLevel.nextLevelXp ?? totalXp;

  return (
    <section className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-[#00acc1] bg-cyan-50 text-5xl font-black text-[#00acc1] sm:h-36 sm:w-36 sm:text-6xl">
          {avatarInitial || "M"}
        </div>

        <div className="flex grow flex-col gap-5">
          <div>
            <p className="text-sm font-bold uppercase text-[#00acc1]">
              Mi Perfil Maker
            </p>
            <h1 className="mt-1 text-3xl font-black text-gray-800 sm:text-4xl">
              {displayName}
            </h1>
            <p className="mt-2 text-xl font-bold text-gray-600">
              {makerLevel.name} — Nivel {makerLevel.levelNumber}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-gray-500">
              <span>
                XP: {totalXp} / {xpGoal} XP
              </span>
              <span>{makerLevel.progressPercent}%</span>
            </div>
            <div
              className="h-5 rounded-full bg-gray-200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={makerLevel.progressPercent}
            >
              <div
                className="h-full rounded-full bg-[#00acc1] px-1 pt-1 transition-all duration-700"
                style={{ width: `${makerLevel.progressPercent}%` }}
              >
                <div className="h-2 w-full rounded-full bg-cyan-300"></div>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Racha actual: {streak} días
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const TeacherModeLink = () => {
  return (
    <section className="flex justify-end">
      <Link
        href="/teacher"
        className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white px-5 py-3 text-sm font-black uppercase text-gray-500 transition hover:bg-cyan-50 hover:text-[#00838f]"
      >
        Modo Profesor
      </Link>
    </section>
  );
};

const SchoolModeLink = () => {
  return (
    <section className="flex justify-end">
      <Link
        href="/school"
        className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white px-5 py-3 text-sm font-black uppercase text-gray-500 transition hover:bg-cyan-50 hover:text-[#00838f]"
      >
        Panel de Escuela
      </Link>
    </section>
  );
};

const JoinClassSection = () => {
  const [classCode, setClassCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const joinClass = async () => {
    setLoading(true);
    const result = await joinClassroomByCode(classCode);
    setLoading(false);

    if (result.ok) {
      setMessage(`¡Te uniste a ${result.classroom.name}!`);
      setClassCode("");
      return;
    }

    setMessage(result.message);
  };

  return (
    <section className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-gray-800">Escuelas Maker</h2>
      <p className="mt-2 font-bold text-gray-500">
        ¿Tu escuela usa Mini Maker? Ingresa el código de tu clase para unirte.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="grow rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-bold uppercase text-gray-700 outline-none transition focus:border-[#00acc1]"
          placeholder="Código de clase"
          value={classCode}
          onChange={(event) => setClassCode(event.target.value.toUpperCase())}
        />
        <button
          className="rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-5 py-3 font-black uppercase text-white transition hover:brightness-105 disabled:opacity-60"
          onClick={() => void joinClass()}
          disabled={loading || classCode.trim() === ""}
        >
          {loading ? "Buscando..." : "Unirme"}
        </button>
      </div>
      {message !== "" && (
        <p className="mt-3 rounded-2xl bg-cyan-50 px-4 py-3 font-bold text-[#00838f]">
          {message}
        </p>
      )}
    </section>
  );
};

const StatsSection = ({
  totalXp,
  streak,
  unlockedKitsCount,
  completedProjects,
}: {
  totalXp: number;
  streak: number;
  unlockedKitsCount: number;
  completedProjects: number;
}) => {
  const stats = [
    { emoji: "⚡", label: "XP total", value: totalXp },
    { emoji: "🔥", label: "Racha", value: streak },
    { emoji: "🧰", label: "Kits desbloqueados", value: unlockedKitsCount },
    { emoji: "🏆", label: "Proyectos completados", value: completedProjects },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="text-3xl">{stat.emoji}</div>
            <div className="mt-3 text-2xl font-black text-gray-800">
              {stat.value}
            </div>
            <div className="text-sm font-bold text-gray-500">{stat.label}</div>
          </article>
        ))}
      </div>
    </section>
  );
};

const MyKitsSection = ({ kits }: { kits: KitProfileData[] }) => {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-black text-gray-800">Mis Kits</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {kits.map((kit) => (
          <article
            key={kit.id}
            className="flex flex-col gap-4 rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-4xl">
                {kit.emoji}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-black text-gray-800">{kit.name}</h3>
                <p className="mt-1 text-sm font-bold text-[#00acc1]">
                  {kit.progress}% · {kit.status}
                </p>
              </div>
            </div>

            <div className="h-4 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-[#00acc1] transition-all duration-700"
                style={{ width: `${kit.progress}%` }}
              />
            </div>

            <Link
              href={`/learn?path=${kit.learningPathId}`}
              className="flex items-center justify-center rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-5 py-3 font-bold uppercase text-white transition hover:brightness-105"
            >
              Continuar
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

const AchievementsSection = ({
  achievements,
}: {
  achievements: Achievement[];
}) => {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-black text-gray-800">Logros</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <article
            key={achievement.name}
            className={[
              "rounded-2xl border-2 border-b-4 bg-white p-5 shadow-sm transition",
              achievement.unlocked
                ? "border-[#00acc1] bg-cyan-50"
                : "border-gray-200 opacity-55 grayscale",
            ].join(" ")}
          >
            <div className="text-4xl">{achievement.emoji}</div>
            <h3 className="mt-3 text-lg font-black text-gray-800">
              {achievement.name}
            </h3>
            <p className="mt-1 min-h-[48px] font-medium text-gray-500">
              {achievement.description}
            </p>
            <div
              className={[
                "mt-4 w-fit rounded-full px-3 py-1 text-xs font-black uppercase",
                achievement.unlocked
                  ? "bg-[#00acc1] text-white"
                  : "bg-gray-200 text-gray-500",
              ].join(" ")}
            >
              {achievement.unlocked ? "Desbloqueado" : "Bloqueado"}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
