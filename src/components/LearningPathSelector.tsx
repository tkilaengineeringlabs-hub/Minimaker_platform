import Link from "next/link";
import { useState } from "react";
import { learningPaths, type LearningPathId } from "~/utils/learningPaths";

export const LearningPathSelector = ({
  selectedPathId,
  isPathUnlocked,
  onSelectPath,
}: {
  selectedPathId: LearningPathId;
  isPathUnlocked: (pathId: LearningPathId) => boolean;
  onSelectPath: (pathId: LearningPathId) => void;
}) => {
  const [lockedPathName, setLockedPathName] = useState("");

  return (
    <div className="flex w-full flex-col">
      <h2 className="px-5 py-3 font-bold uppercase text-gray-400">
        Rutas maker
      </h2>
      {learningPaths.map((learningPath) => {
        const unlocked = isPathUnlocked(learningPath.id);
        const selected = learningPath.id === selectedPathId;

        return (
          <button
            key={learningPath.id}
            className={[
              "flex w-full items-center gap-3 border-t-2 border-gray-300 px-5 py-3 text-left font-bold transition",
              selected && unlocked
                ? "bg-cyan-50 text-[#00838f]"
                : unlocked
                  ? "text-gray-600 hover:bg-gray-100"
                  : "text-gray-400",
            ].join(" ")}
            onClick={() => {
              if (!unlocked) {
                setLockedPathName(learningPath.name);
                return;
              }

              setLockedPathName("");
              onSelectPath(learningPath.id);
            }}
          >
            <span className="text-3xl" aria-hidden="true">
              {unlocked ? learningPath.emoji : "🔒"}
            </span>
            <span>{learningPath.name}</span>
          </button>
        );
      })}

      {lockedPathName !== "" && (
        <div className="flex flex-col gap-3 border-t-2 border-gray-300 px-5 py-4">
          <p className="text-sm font-bold text-gray-500">
            Necesitas desbloquear este kit primero.
          </p>
          <Link
            className="flex w-full items-center justify-center rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-4 py-3 font-bold uppercase text-white transition hover:brightness-105"
            href="/shop"
          >
            Ver kit
          </Link>
        </div>
      )}
    </div>
  );
};
