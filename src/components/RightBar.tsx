import Link from "next/link";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { BronzeLeagueSvg, EmptyFireSvg, FireSvg } from "./Svgs";
import { StreakModal } from "./Calendar";
import { TeslaCoilIcon, TeslasModal } from "./TeslaReward";
import { useBoundStore } from "~/hooks/useBoundStore";
import type { LoginScreenState } from "./LoginScreen";
import { LoginScreen } from "./LoginScreen";
import { useLeaderboardRank } from "~/hooks/useLeaderboard";
import {
  defaultLearningPathId,
  getLearningPathById,
  type LearningPathId,
} from "~/utils/learningPaths";
import { getMakerSidebarCards } from "~/utils/makerSidebarCards";

const lessonsPerActivity = 4;

export const RightBar = ({
  learningPathId = defaultLearningPathId,
  learningPathName = "Fundamentos Maker",
  learningPathEmoji = "🤖",
  learningPathMenu,
}: {
  learningPathId?: LearningPathId;
  learningPathName?: string;
  learningPathEmoji?: string;
  learningPathMenu?: React.ReactNode;
}) => {
  const loggedIn = useBoundStore((x) => x.loggedIn);
  const teslas = useBoundStore((x) => x.teslas);
  const streak = useBoundStore((x) => x.streak);
  const lessonsCompleted = useBoundStore((x) => x.lessonsCompleted);

  const [languagesShown, setLanguagesShown] = useState(false);

  const [streakShown, setStreakShown] = useState(false);
  const [now, setNow] = useState(dayjs());

  const [teslasShown, setTeslasShown] = useState(false);

  const [loginScreenState, setLoginScreenState] =
    useState<LoginScreenState>("HIDDEN");

  return (
    <>
      <aside className="sticky top-0 hidden w-96 flex-col gap-6 self-start sm:flex">
        <article className="my-6 flex justify-between gap-4">
          <div
            className="relative flex cursor-default items-center gap-2 rounded-xl p-3 font-bold uppercase text-gray-500 hover:bg-gray-100"
            onMouseEnter={() => setLanguagesShown(true)}
            onMouseLeave={() => setLanguagesShown(false)}
            onClick={() => setLanguagesShown((x) => !x)}
            role="button"
            tabIndex={0}
          >
            <span className="text-3xl" aria-hidden="true">
              {learningPathEmoji}
            </span>
            <div>{learningPathName}</div>
            <div
              className="absolute top-full z-10 rounded-2xl border-2 border-gray-300 bg-white"
              style={{
                left: "calc(50% - 150px)",
                width: 300,
                display: languagesShown ? "block" : "none",
              }}
            >
              {learningPathMenu ?? (
                <>
                  <h2 className="px-5 py-3 font-bold uppercase text-gray-400">
                    Programas
                  </h2>
                  <button className="flex w-full items-center gap-3 border-t-2 border-gray-300 bg-blue-100 px-5 py-3 text-left font-bold">
                    <span className="text-3xl" aria-hidden="true">
                      {learningPathEmoji}
                    </span>
                    <span className="text-blue-500">{learningPathName}</span>
                  </button>
                  <Link
                    className="flex w-full items-center gap-3 rounded-b-2xl border-t-2 border-gray-300 px-5 py-3 text-left font-bold hover:bg-gray-100"
                    href="/register"
                  >
                    <span className="flex items-center justify-center rounded-lg border-2 border-gray-400 px-2 text-lg font-bold text-gray-400">
                      +
                    </span>
                    <span className="text-gray-600">Explorar nuevas rutas</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          <button
            className="relative flex items-center gap-2 rounded-xl p-3 font-bold text-orange-500 hover:bg-gray-100"
            onClick={() => {
              setStreakShown(true);
              setNow(dayjs());
            }}
            aria-label="Abrir racha"
          >
            <div className="pointer-events-none">
              {streak > 0 ? <FireSvg /> : <EmptyFireSvg />}
            </div>
            <span className={streak > 0 ? "text-orange-500" : "text-gray-300"}>
              {streak}
            </span>
          </button>
          <button
            className="relative flex items-center gap-2 rounded-xl p-3 font-bold text-[#00838f] hover:bg-gray-100"
            onClick={() => setTeslasShown(true)}
            aria-label="Abrir Teslas"
          >
            <TeslaCoilIcon size={30} muted={teslas === 0} />
            <span className={teslas > 0 ? "text-[#00838f]" : "text-gray-300"}>
              {teslas}
            </span>
          </button>
        </article>
        {loggedIn && lessonsCompleted < 10 ? (
          <UnlockLeaderboardsSection />
        ) : loggedIn && lessonsCompleted >= 10 ? (
          <LeaderboardRankSection />
        ) : null}
        <MakerChallengeSection learningPathId={learningPathId} />
        <CurrentProjectSection learningPathId={learningPathId} />
        {!loggedIn && (
          <CreateAProfileSection setLoginScreenState={setLoginScreenState} />
        )}
      </aside>
      <LoginScreen
        loginScreenState={loginScreenState}
        setLoginScreenState={setLoginScreenState}
      />
      <StreakModal
        isShown={streakShown}
        now={now}
        setNow={setNow}
        onClose={() => setStreakShown(false)}
      />
      <TeslasModal
        isShown={teslasShown}
        teslas={teslas}
        onClose={() => setTeslasShown(false)}
      />
    </>
  );
};

const UnlockLeaderboardsSection = () => {
  const lessonsCompleted = useBoundStore((x) => x.lessonsCompleted);

  if (lessonsCompleted >= 10) {
    return null;
  }

  const lessonsNeededToUnlockLeaderboards = 10 - lessonsCompleted;

  return (
    <article className="flex flex-col gap-5 rounded-2xl border-2 border-gray-200 p-6 text-gray-700">
      <h2 className="text-xl font-bold">¡Desbloquea la clasificación!</h2>
      <div className="flex items-center gap-6">
        <LockedLeaderboardsSvg />
        <p className="text-sm leading-6 text-gray-500">
          Completa {lessonsNeededToUnlockLeaderboards}{" "}
          {lessonsNeededToUnlockLeaderboards === 1
            ? "lección más"
            : "lecciones más"}{" "}
          para comenzar a competir.
        </p>
      </div>
    </article>
  );
};

const LeaderboardRankSection = () => {
  const xpThisWeek = useBoundStore((x) => x.xpThisWeek());
  const rank = useLeaderboardRank();
  const leaderboardLeague = "Liga Bronce";
  return (
    <article className="flex flex-col gap-5 rounded-2xl border-2 border-gray-200 p-6 text-gray-700">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{leaderboardLeague}</h2>
        <Link href="/leaderboard" className="font-bold uppercase text-blue-400">
          Ver clasificación
        </Link>
      </div>
      <div className="flex gap-6">
        <BronzeLeagueSvg />
        <div className="flex flex-col gap-5">
          {rank !== null && (
            <p className="text-lg font-bold text-gray-700">
              {`Vas en el puesto #${rank}`}
            </p>
          )}
          <p className="text-sm leading-6 text-gray-500">
            Has conseguido {xpThisWeek} XP esta semana.
          </p>
        </div>
      </div>
    </article>
  );
};

const MakerChallengeSection = ({
  learningPathId,
}: {
  learningPathId: LearningPathId;
}) => {
  const { challenge } = getMakerSidebarCards(learningPathId);

  return (
    <article className="flex flex-col gap-4 rounded-2xl border-2 border-gray-200 p-6 font-bold text-gray-700">
      <div className="flex items-center gap-2 text-sm uppercase text-[#00acc1]">
        <span className="text-2xl" aria-hidden="true">
          ⚡
        </span>
        <h2>Reto Maker</h2>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl leading-tight">{challenge.title}</h3>
        <p className="text-sm font-normal leading-6 text-gray-500">
          {challenge.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-xl bg-yellow-50 px-3 py-2 text-yellow-600">
          🏆 +{challenge.xpReward} XP
        </span>
        <span className="rounded-xl bg-cyan-50 px-3 py-2 text-[#00838f]">
          <span aria-hidden="true">⚡</span> +{challenge.teslasReward} Teslas
        </span>
      </div>
      <Link
        href={`/learn?path=${learningPathId}`}
        className="mt-1 rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] py-3 text-center text-sm uppercase text-white transition hover:border-[#00acc1] hover:bg-[#16c3d6]"
      >
        Ir al reto
      </Link>
    </article>
  );
};

const CurrentProjectSection = ({
  learningPathId,
}: {
  learningPathId: LearningPathId;
}) => {
  const { project } = getMakerSidebarCards(learningPathId);
  const lessonsCompleted = useBoundStore((x) =>
    x.lessonsCompletedForPath(learningPathId),
  );

  const { completedActivities, progressPercent, totalActivities } =
    useMemo(() => {
      const learningPath = getLearningPathById(learningPathId);
      const activities =
        learningPath?.units.reduce(
          (total, unit) => total + unit.tiles.length,
          0,
        ) ?? 0;
      const completed = Math.min(
        activities,
        Math.floor(lessonsCompleted / lessonsPerActivity),
      );

      return {
        completedActivities: completed,
        progressPercent:
          activities === 0 ? 0 : Math.round((completed / activities) * 100),
        totalActivities: activities,
      };
    }, [learningPathId, lessonsCompleted]);

  return (
    <article className="flex flex-col gap-4 rounded-2xl border-2 border-gray-200 p-6 font-bold text-gray-700">
      <div className="flex items-center gap-2 text-sm uppercase text-[#00acc1]">
        <span className="text-2xl" aria-hidden="true">
          🔧
        </span>
        <h2>Proyecto en curso</h2>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl leading-tight">{project.title}</h3>
        <p className="text-sm font-normal leading-6 text-gray-500">
          {project.description}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
        <span>
          {completedActivities} de {totalActivities} actividades
        </span>
        <span className="text-[#00acc1]">{progressPercent}%</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-[#00acc1] transition-all"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="mx-2 mt-1 h-[6px] rounded-full bg-cyan-200/80" />
        </div>
      </div>
      <Link
        href={`/learn?path=${learningPathId}`}
        className="mt-1 rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] py-3 text-center text-sm uppercase text-white transition hover:border-[#00acc1] hover:bg-[#16c3d6]"
      >
        Continuar proyecto
      </Link>
    </article>
  );
};

const LockedLeaderboardsSvg = () => {
  return (
    <svg width="40" height="46" viewBox="0 0 40 46" fill="none">
      <path
        d="M6.82875 3.41476L33.1701 3.41476C36.9418 3.41476 39.9993 6.47231 39.9993 10.244V26.3415C39.9993 36.8483 31.4819 45.3658 20.975 45.3658H19.0238C8.51698 45.3658 -0.000488281 36.8483 -0.000488281 26.3415L-0.000488281 10.244C-0.000488281 6.47231 3.05707 3.41476 6.82875 3.41476Z"
        fill="#AAC1D4"
      />
      <path
        d="M23.544 3.41476L33.1698 3.41476C36.9415 3.41476 39.9991 6.47231 39.9991 10.244V14.554L10.9707 43.5824C4.66224 40.6308 0.240328 34.3187 0.00878906 26.95L23.544 3.41476Z"
        fill="#C2D1DD"
      />
      <path
        d="M6.82875 -1.52588e-05L33.1701 -1.52588e-05C36.9418 -1.52588e-05 39.9993 3.05754 39.9993 6.82922V23.9023C39.9993 33.8703 31.9187 41.951 21.9506 41.951H18.0482C8.08019 41.951 -0.000488281 33.8703 -0.000488281 23.9023L-0.000488281 6.82922C-0.000488281 3.05754 3.05707 -1.52588e-05 6.82875 -1.52588e-05Z"
        fill="#C2D1DD"
      />
      <path
        d="M6.82875 4.39021C5.48172 4.39021 4.38974 5.48219 4.38974 6.82922L4.38974 23.9023C4.38974 31.4457 10.5048 37.5608 18.0482 37.5608H21.9506C29.494 37.5608 35.6091 31.4457 35.6091 23.9023V6.82922C35.6091 5.48219 34.5171 4.39021 33.1701 4.39021L6.82875 4.39021ZM6.82875 -1.52588e-05L33.1701 -1.52588e-05C36.9418 -1.52588e-05 39.9993 3.05754 39.9993 6.82922V23.9023C39.9993 33.8703 31.9187 41.951 21.9506 41.951H18.0482C8.08019 41.951 -0.000488281 33.8703 -0.000488281 23.9023L-0.000488281 6.82922C-0.000488281 3.05754 3.05707 -1.52588e-05 6.82875 -1.52588e-05Z"
        fill="#D6E4EF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.0277 22.1682C15.8255 21.312 15.0474 19.9455 15.0474 18.4059C15.0474 15.813 17.2544 13.7111 19.9769 13.7111C22.6994 13.7111 24.9064 15.813 24.9064 18.4059C24.9064 19.9765 24.0966 21.3669 22.853 22.2192L24.1155 25.5237C24.4553 26.4131 23.9457 27.3871 22.9772 27.6992C22.7794 27.7629 22.5714 27.7954 22.3619 27.7954H17.4994C16.473 27.7954 15.6409 27.0313 15.6409 26.0887C15.6409 25.8963 15.6764 25.7053 15.7458 25.5237L17.0277 22.1682Z"
        fill="#8097AA"
      />
    </svg>
  );
};

const CreateAProfileSection = ({
  setLoginScreenState,
}: {
  setLoginScreenState: React.Dispatch<React.SetStateAction<LoginScreenState>>;
}) => {
  return (
    <article className="flex flex-col gap-5 rounded-2xl border-2 border-gray-200 p-6 font-bold">
      <h2 className="text-xl">¡Crea un perfil para guardar tu progreso!</h2>
      <button
        className="rounded-2xl border-b-4 border-green-600 bg-green-500 py-3 uppercase text-white transition hover:border-green-500 hover:bg-green-400"
        onClick={() => setLoginScreenState("SIGNUP")}
      >
        Crear perfil
      </button>
      <button
        className="rounded-2xl border-b-4 border-blue-500 bg-blue-400 py-3 uppercase text-white transition hover:border-blue-400 hover:bg-blue-300"
        onClick={() => setLoginScreenState("LOGIN")}
      >
        Iniciar sesión
      </button>
    </article>
  );
};
