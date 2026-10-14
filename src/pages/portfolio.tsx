import type { NextPage } from "next";
import Link from "next/link";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { TopBar } from "~/components/TopBar";
import { useBoundStore } from "~/hooks/useBoundStore";
import { learningPaths, type LearningPath } from "~/utils/learningPaths";
import type { Tile } from "~/utils/units";

const lessonsPerTile = 4;

type CompletedTile = {
  pathName: string;
  unitNumber: number;
  tile: Tile;
};

type Skill = {
  emoji: string;
  name: string;
  keywords: string[];
};

const skills: Skill[] = [
  {
    emoji: "⚡",
    name: "Electrónica",
    keywords: ["electricidad", "led", "circuito"],
  },
  {
    emoji: "🔧",
    name: "Construcción",
    keywords: ["construye", "monta", "instala", "chasis"],
  },
  {
    emoji: "🤖",
    name: "Robótica",
    keywords: ["robot", "rover", "motores", "ruedas"],
  },
  {
    emoji: "💻",
    name: "Programación",
    keywords: ["secuencia", "reglas", "si ocurre", "entonces"],
  },
  {
    emoji: "📡",
    name: "Sensores",
    keywords: ["sensor", "detecta", "distancia", "luz"],
  },
  {
    emoji: "🧠",
    name: "Automatización",
    keywords: ["automatización", "decisiones", "acción"],
  },
];

const getCompletedTilesForPath = (
  learningPath: LearningPath,
  lessonsCompleted: number,
): CompletedTile[] => {
  const completedTileCount = Math.floor(lessonsCompleted / lessonsPerTile);
  let tileIndex = 0;

  return learningPath.units.flatMap((unit) =>
    unit.tiles.flatMap((tile) => {
      const isCompleted = tileIndex < completedTileCount;
      tileIndex += 1;

      return isCompleted
        ? [
            {
              pathName: learningPath.name,
              unitNumber: unit.unitNumber,
              tile,
            },
          ]
        : [];
    }),
  );
};

const getTileDescription = (tile: Tile): string =>
  "description" in tile ? tile.description : "Recompensa Maker";

const descriptionIncludes = (tile: Tile, keywords: string[]): boolean => {
  const description = getTileDescription(tile).toLowerCase();
  return keywords.some((keyword) => description.includes(keyword));
};

const Portfolio: NextPage = () => {
  const progressByPath = useBoundStore((x) => x.progressByPath);

  const completedTiles = learningPaths.flatMap((learningPath) =>
    getCompletedTilesForPath(
      learningPath,
      progressByPath[learningPath.id] ?? 0,
    ),
  );

  const projectTiles = completedTiles.filter(
    ({ tile }) =>
      tile.type === "trophy" &&
      getTileDescription(tile).toLowerCase().includes("proyecto"),
  );
  const challengeTiles = completedTiles.filter(
    ({ tile }) =>
      tile.type === "trophy" &&
      getTileDescription(tile).toLowerCase().includes("reto"),
  );
  const circuitTiles = completedTiles.filter(({ tile }) =>
    descriptionIncludes(tile, ["circuito", "led", "electricidad"]),
  );
  const robotTiles = completedTiles.filter(({ tile }) =>
    descriptionIncludes(tile, ["robot", "rover", "motor", "rueda"]),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <LeftBar selectedTab={null} />
      <BottomBar selectedTab={null} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-4 py-20 pb-28 sm:px-6 md:pl-28 lg:pl-72">
        <section className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#00acc1]">
            Mi espacio
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-800 sm:text-4xl">
            Mi Portafolio Maker
          </h1>
          <p className="mt-3 text-lg font-bold text-gray-500">
            Todo lo que construyes cuenta tu historia como Maker.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <PortfolioStat
            emoji="🔧"
            label="Proyectos realizados"
            value={projectTiles.length}
          />
          <PortfolioStat
            emoji="⚡"
            label="Circuitos construidos"
            value={circuitTiles.length}
          />
          <PortfolioStat
            emoji="🤖"
            label="Robots creados"
            value={robotTiles.length}
          />
          <PortfolioStat
            emoji="🏆"
            label="Retos superados"
            value={challengeTiles.length}
          />
        </section>

        <section className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-gray-800">Mis proyectos</h2>
          {projectTiles.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-cyan-50 p-5">
              <p className="text-lg font-black text-gray-800">
                Aún no has terminado tu primer proyecto.
              </p>
              <p className="mt-2 font-bold text-gray-500">
                Completa proyectos en tus rutas Maker y aparecerán aquí.
              </p>
              <Link
                href="/learn"
                className="mt-5 inline-flex rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-5 py-3 font-black uppercase text-white transition hover:brightness-105"
              >
                Ir a construir
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {projectTiles.map(({ tile, pathName, unitNumber }) => (
                <article
                  key={`${pathName}-${unitNumber}-${getTileDescription(tile)}`}
                  className="rounded-2xl border-2 border-gray-200 bg-slate-50 p-4"
                >
                  <div className="text-3xl">🛠️</div>
                  <h3 className="mt-3 text-lg font-black text-gray-800">
                    {getTileDescription(tile).replace(/^Proyecto:\s*/i, "")}
                  </h3>
                  <p className="mt-1 font-bold text-gray-500">
                    {pathName} · Unidad {unitNumber}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-black text-gray-800">
            Habilidades Maker
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => {
              const unlocked = completedTiles.some(({ tile }) =>
                descriptionIncludes(tile, skill.keywords),
              );

              return (
                <article
                  key={skill.name}
                  className={[
                    "rounded-2xl border-2 border-b-4 bg-white p-4 shadow-sm transition",
                    unlocked
                      ? "border-[#00acc1]"
                      : "border-gray-200 opacity-60 grayscale",
                  ].join(" ")}
                >
                  <div className="text-3xl">{skill.emoji}</div>
                  <h3 className="mt-3 text-lg font-black text-gray-800">
                    {skill.name}
                  </h3>
                  <p className="mt-1 text-sm font-black uppercase text-gray-400">
                    {unlocked ? "En progreso" : "Por descubrir"}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Portfolio;

const PortfolioStat = ({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: number;
}) => (
  <article className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4 shadow-sm">
    <div className="text-3xl">{emoji}</div>
    <div className="mt-3 text-3xl font-black text-gray-800">{value}</div>
    <div className="text-sm font-bold text-gray-500">{label}</div>
  </article>
);
