import type { NextPage } from "next";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import {
  BigCloseSvg,
  CloseSvg,
  DoneSvg,
  LessonFastForwardEndFailSvg,
  LessonFastForwardEndPassSvg,
  LessonFastForwardStartSvg,
} from "~/components/Svgs";
import { useBoundStore } from "~/hooks/useBoundStore";
import { useRouter } from "next/router";
import {
  defaultLearningPathId,
  getLearningPathById,
  type LearningPathId,
} from "~/utils/learningPaths";
import { getKitById, isKitUnlocked, readUnlockedKitIds } from "~/utils/kits";
import { saveLearningProgress } from "~/services/progressService";

const makerLessonXp = 10;
const makerLessonSteps = 5;

const getQueryValue = (
  value: string | string[] | undefined,
): string | undefined => (typeof value === "string" ? value : undefined);

const getLessonPathId = (
  path: string | string[] | undefined,
): LearningPathId => {
  const learningPath = getLearningPathById(getQueryValue(path));
  return learningPath?.id ?? defaultLearningPathId;
};

const getLearnHref = (pathId: LearningPathId): string =>
  `/learn?path=${pathId}`;

const kitParts = [
  { name: "LED", description: "Produce luz" },
  { name: "Motor", description: "Produce movimiento" },
  { name: "Cable", description: "Transporta electricidad" },
  { name: "Interruptor", description: "Abre o cierra un circuito" },
] as const;

type MakerQuiz = {
  question: string;
  options: readonly string[];
  correctAnswer: string;
  correctFeedback: string;
  incorrectFeedback: string;
};

const makerQuizzes = [
  {
    question: "¿Cuál de estos componentes puede producir luz?",
    options: ["LED", "Motor", "Cable", "Interruptor"],
    correctAnswer: "LED",
    correctFeedback: "¡Correcto! Un LED convierte energía eléctrica en luz.",
    incorrectFeedback: "Inténtalo otra vez.",
  },
  {
    question: "¿Qué componente usarías si quieres que un robot se mueva?",
    options: ["LED", "Motor", "Resistencia", "Cable"],
    correctAnswer: "Motor",
    correctFeedback:
      "¡Exacto! Los motores convierten energía eléctrica en movimiento.",
    incorrectFeedback: "Inténtalo otra vez.",
  },
] as const satisfies readonly MakerQuiz[];

const formatTime = (timeMs: number): string => {
  const seconds = Math.floor(timeMs / 1000) % 60;
  const minutes = Math.floor(timeMs / 1000 / 60) % 60;
  const hours = Math.floor(timeMs / 1000 / 60 / 60);
  if (hours === 0)
    return [minutes, seconds]
      .map((x) => x.toString().padStart(2, "0"))
      .join(":");
  return [hours, minutes, seconds]
    .map((x) => x.toString().padStart(2, "0"))
    .join(":");
};

const Lesson: NextPage = () => {
  const router = useRouter();
  const pathId = getLessonPathId(router.query.path);

  const [lessonStep, setLessonStep] = useState(0);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [incorrectAnswerCount, setIncorrectAnswerCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswerShown, setCorrectAnswerShown] = useState(false);
  const [quitMessageShown, setQuitMessageShown] = useState(false);
  const [checkedKitParts, setCheckedKitParts] = useState<string[]>([]);

  const startTime = useRef(Date.now());
  const endTime = useRef(startTime.current + 1000 * 60 * 3 + 1000 * 33);

  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [reviewLessonShown, setReviewLessonShown] = useState(false);

  const [isStartingLesson, setIsStartingLesson] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const learningPath = getLearningPathById(pathId);
    const kit =
      learningPath !== undefined ? getKitById(learningPath.kitId) : undefined;
    const routeIsUnlocked =
      kit !== undefined && isKitUnlocked(kit, readUnlockedKitIds());

    if (!routeIsUnlocked) {
      void router.replace(getLearnHref(defaultLearningPathId));
    }
  }, [pathId, router]);

  const hearts =
    "fast-forward" in router.query &&
    !isNaN(Number(router.query["fast-forward"]))
      ? 3 - incorrectAnswerCount
      : null;

  const quiz =
    lessonStep === 1
      ? makerQuizzes[0]
      : lessonStep === 4
        ? makerQuizzes[1]
        : null;
  const isAnswerCorrect =
    quiz !== null ? selectedAnswer === quiz.correctAnswer : false;

  const onCheckAnswer = () => {
    if (quiz === null || selectedAnswer === null) return;

    setCorrectAnswerShown(true);
    if (isAnswerCorrect) {
      setCorrectAnswerCount((x) => x + 1);
    } else {
      setIncorrectAnswerCount((x) => x + 1);
    }
    setQuestionResults((questionResults) => [
      ...questionResults,
      {
        question: quiz.question,
        yourResponse: selectedAnswer,
        correctResponse: quiz.correctAnswer,
      },
    ]);
  };

  const goToNextStep = () => {
    setSelectedAnswer(null);
    setCorrectAnswerShown(false);
    setLessonStep((x) => x + 1);
    endTime.current = Date.now();
  };

  const onFinishQuestion = () => {
    if (isAnswerCorrect) {
      goToNextStep();
      return;
    }

    setSelectedAnswer(null);
    setCorrectAnswerShown(false);
  };

  const unitNumber = Number(router.query["fast-forward"]);

  if (hearts !== null && hearts < 0 && !correctAnswerShown) {
    return (
      <LessonFastForwardEndFail
        unitNumber={unitNumber}
        pathId={pathId}
        reviewLessonShown={reviewLessonShown}
        setReviewLessonShown={setReviewLessonShown}
        questionResults={questionResults}
      />
    );
  }

  if (
    hearts !== null &&
    hearts >= 0 &&
    !correctAnswerShown &&
    correctAnswerCount >= makerQuizzes.length
  ) {
    return (
      <LessonFastForwardEndPass
        unitNumber={unitNumber}
        pathId={pathId}
        reviewLessonShown={reviewLessonShown}
        setReviewLessonShown={setReviewLessonShown}
        questionResults={questionResults}
      />
    );
  }

  if (hearts !== null && isStartingLesson) {
    return (
      <LessonFastForwardStart
        unitNumber={unitNumber}
        pathId={pathId}
        setIsStartingLesson={setIsStartingLesson}
      />
    );
  }

  if (lessonStep >= makerLessonSteps && !correctAnswerShown) {
    return (
      <LessonComplete
        correctAnswerCount={correctAnswerCount}
        incorrectAnswerCount={incorrectAnswerCount}
        xpAward={makerLessonXp}
        startTime={startTime}
        endTime={endTime}
        reviewLessonShown={reviewLessonShown}
        setReviewLessonShown={setReviewLessonShown}
        questionResults={questionResults}
        pathId={pathId}
      />
    );
  }

  switch (lessonStep) {
    case 0:
      return (
        <MakerIntroStep
          lessonStep={lessonStep}
          totalSteps={makerLessonSteps}
          quitMessageShown={quitMessageShown}
          setQuitMessageShown={setQuitMessageShown}
          hearts={hearts}
          onContinue={goToNextStep}
        />
      );

    case 1:
      return (
        <MakerQuizStep
          lessonStep={lessonStep}
          totalSteps={makerLessonSteps}
          quiz={makerQuizzes[0]}
          selectedAnswer={selectedAnswer}
          setSelectedAnswer={setSelectedAnswer}
          quitMessageShown={quitMessageShown}
          correctAnswerShown={correctAnswerShown}
          setQuitMessageShown={setQuitMessageShown}
          isAnswerCorrect={isAnswerCorrect}
          onCheckAnswer={onCheckAnswer}
          onFinish={onFinishQuestion}
          hearts={hearts}
        />
      );

    case 2:
      return (
        <MakerPartsStep
          lessonStep={lessonStep}
          totalSteps={makerLessonSteps}
          quitMessageShown={quitMessageShown}
          setQuitMessageShown={setQuitMessageShown}
          hearts={hearts}
          onContinue={goToNextStep}
        />
      );

    case 3:
      return (
        <MakerChecklistStep
          lessonStep={lessonStep}
          totalSteps={makerLessonSteps}
          checkedKitParts={checkedKitParts}
          setCheckedKitParts={setCheckedKitParts}
          quitMessageShown={quitMessageShown}
          setQuitMessageShown={setQuitMessageShown}
          hearts={hearts}
          onContinue={goToNextStep}
        />
      );

    case 4:
    default:
      return (
        <MakerQuizStep
          lessonStep={lessonStep}
          totalSteps={makerLessonSteps}
          quiz={makerQuizzes[1]}
          selectedAnswer={selectedAnswer}
          setSelectedAnswer={setSelectedAnswer}
          quitMessageShown={quitMessageShown}
          correctAnswerShown={correctAnswerShown}
          setQuitMessageShown={setQuitMessageShown}
          isAnswerCorrect={isAnswerCorrect}
          onCheckAnswer={onCheckAnswer}
          onFinish={onFinishQuestion}
          hearts={hearts}
        />
      );
  }
};

export default Lesson;

const ProgressBar = ({
  correctAnswerCount,
  totalCorrectAnswersNeeded,
  setQuitMessageShown,
  hearts,
}: {
  correctAnswerCount: number;
  totalCorrectAnswersNeeded: number;
  setQuitMessageShown: (isShown: boolean) => void;
  hearts: null | number;
}) => {
  const router = useRouter();
  const pathId = getLessonPathId(router.query.path);

  return (
    <header className="flex items-center gap-4">
      {correctAnswerCount === 0 ? (
        <Link href={getLearnHref(pathId)} className="text-gray-400">
          <CloseSvg />
          <span className="sr-only">Salir de la lección</span>
        </Link>
      ) : (
        <button
          className="text-gray-400"
          onClick={() => setQuitMessageShown(true)}
        >
          <CloseSvg />
          <span className="sr-only">Salir de la lección</span>
        </button>
      )}
      <div
        className="h-4 grow rounded-full bg-gray-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={correctAnswerCount / totalCorrectAnswersNeeded}
      >
        <div
          className={
            "h-full rounded-full bg-green-500 transition-all duration-700 " +
            (correctAnswerCount > 0 ? "px-2 pt-1" : "")
          }
          style={{
            width: `${(correctAnswerCount / totalCorrectAnswersNeeded) * 100}%`,
          }}
        >
          <div className="h-[5px] w-full rounded-full bg-green-400"></div>
        </div>
      </div>
      {hearts !== null &&
        [1, 2, 3].map((charge) => (
          <span
            key={charge}
            className={[
              "flex h-8 w-8 items-center justify-center rounded-full border-2 text-lg",
              charge <= hearts
                ? "border-[#00acc1] bg-cyan-50 text-[#00838f]"
                : "border-gray-200 bg-gray-50 text-gray-300",
            ].join(" ")}
            aria-label={
              charge <= hearts ? "Carga disponible" : "Carga usada"
            }
          >
            ⚡
          </span>
        ))}
    </header>
  );
};

const QuitMessage = ({
  quitMessageShown,
  setQuitMessageShown,
}: {
  quitMessageShown: boolean;
  setQuitMessageShown: (isShown: boolean) => void;
}) => {
  const router = useRouter();
  const pathId = getLessonPathId(router.query.path);

  return (
    <>
      <div
        className={
          quitMessageShown
            ? "fixed bottom-0 left-0 right-0 top-0 z-30 bg-black bg-opacity-60 transition-all duration-300"
            : "pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-30 bg-black bg-opacity-0 transition-all duration-300"
        }
        onClick={() => setQuitMessageShown(false)}
        aria-label="Cerrar mensaje de salida"
        role="button"
      ></div>

      <article
        className={
          quitMessageShown
            ? "fixed bottom-0 left-0 right-0 z-40 flex flex-col gap-4 bg-white px-5 py-12 text-center transition-all duration-300 sm:flex-row"
            : "fixed -bottom-96 left-0 right-0 z-40 flex flex-col bg-white px-5 py-12 text-center transition-all duration-300 sm:flex-row"
        }
        aria-hidden={!quitMessageShown}
      >
        <div className="flex grow flex-col gap-4">
          <h2 className="text-lg font-bold sm:text-2xl">
            ¿Seguro que quieres salir?
          </h2>
          <p className="text-gray-500 sm:text-lg">
            Perderás el avance de esta lección.
          </p>
        </div>
        <div className="flex grow flex-col items-center justify-center gap-4 sm:flex-row-reverse">
          <Link
            className="flex w-full items-center justify-center rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] py-3 font-bold uppercase text-white transition hover:brightness-105 sm:w-48"
            href={getLearnHref(pathId)}
          >
            Salir
          </Link>
          <button
            className="w-full rounded-2xl py-3 font-bold uppercase text-[#00acc1] transition hover:brightness-90 sm:w-48 sm:border-2 sm:border-b-4 sm:border-gray-300 sm:text-gray-400 sm:hover:bg-gray-100"
            onClick={() => setQuitMessageShown(false)}
          >
            Continuar
          </button>
        </div>
      </article>
    </>
  );
};

const LessonShell = ({
  lessonStep,
  totalSteps,
  quitMessageShown,
  setQuitMessageShown,
  hearts,
  children,
  footer,
}: {
  lessonStep: number;
  totalSteps: number;
  quitMessageShown: boolean;
  setQuitMessageShown: (isShown: boolean) => void;
  hearts: number | null;
  children: React.ReactNode;
  footer: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-screen flex-col gap-5 px-4 py-5 sm:px-0 sm:py-0">
      <div className="flex grow flex-col items-center gap-5">
        <div className="w-full max-w-5xl sm:mt-8 sm:px-5">
          <ProgressBar
            correctAnswerCount={lessonStep}
            totalCorrectAnswersNeeded={totalSteps}
            setQuitMessageShown={setQuitMessageShown}
            hearts={hearts}
          />
        </div>
        {children}
      </div>

      {footer}

      <QuitMessage
        quitMessageShown={quitMessageShown}
        setQuitMessageShown={setQuitMessageShown}
      />
    </div>
  );
};

const ContinueFooter = ({
  disabled = false,
  onContinue,
}: {
  disabled?: boolean;
  onContinue: () => void;
}) => {
  return (
    <section className="border-gray-200 sm:border-t-2 sm:p-10">
      <div className="mx-auto flex max-w-5xl sm:justify-end">
        <button
          className={
            disabled
              ? "grow rounded-2xl bg-gray-200 p-3 font-bold uppercase text-gray-400 sm:min-w-[180px] sm:max-w-fit sm:grow-0"
              : "grow rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] p-3 font-bold uppercase text-white transition hover:brightness-105 sm:min-w-[180px] sm:max-w-fit sm:grow-0"
          }
          disabled={disabled}
          onClick={onContinue}
        >
          Continuar
        </button>
      </div>
    </section>
  );
};

const MakerIntroStep = ({
  lessonStep,
  totalSteps,
  quitMessageShown,
  setQuitMessageShown,
  hearts,
  onContinue,
}: {
  lessonStep: number;
  totalSteps: number;
  quitMessageShown: boolean;
  setQuitMessageShown: (isShown: boolean) => void;
  hearts: number | null;
  onContinue: () => void;
}) => {
  return (
    <LessonShell
      lessonStep={lessonStep}
      totalSteps={totalSteps}
      quitMessageShown={quitMessageShown}
      setQuitMessageShown={setQuitMessageShown}
      hearts={hearts}
      footer={<ContinueFooter onContinue={onContinue} />}
    >
      <section className="flex max-w-2xl grow flex-col justify-center gap-5 self-center sm:px-5">
        <div className="text-6xl">🤖</div>
        <h1 className="text-3xl font-bold text-gray-800">Conoce tu Kit</h1>
        <p className="text-xl font-medium leading-relaxed text-gray-500">
          Antes de construir, vamos a descubrir las piezas que usarás en tus
          primeros proyectos.
        </p>
      </section>
    </LessonShell>
  );
};

const MakerPartsStep = ({
  lessonStep,
  totalSteps,
  quitMessageShown,
  setQuitMessageShown,
  hearts,
  onContinue,
}: {
  lessonStep: number;
  totalSteps: number;
  quitMessageShown: boolean;
  setQuitMessageShown: (isShown: boolean) => void;
  hearts: number | null;
  onContinue: () => void;
}) => {
  return (
    <LessonShell
      lessonStep={lessonStep}
      totalSteps={totalSteps}
      quitMessageShown={quitMessageShown}
      setQuitMessageShown={setQuitMessageShown}
      hearts={hearts}
      footer={<ContinueFooter onContinue={onContinue} />}
    >
      <section className="flex max-w-2xl grow flex-col justify-center gap-8 self-center sm:px-5">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Cada pieza tiene una función
        </h1>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {kitParts.map((part) => (
            <article
              key={part.name}
              className="rounded-xl border-2 border-b-4 border-gray-200 p-5"
            >
              <h2 className="text-xl font-bold text-[#00acc1]">{part.name}</h2>
              <p className="mt-2 font-medium text-gray-500">
                {part.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </LessonShell>
  );
};

const MakerChecklistStep = ({
  lessonStep,
  totalSteps,
  checkedKitParts,
  setCheckedKitParts,
  quitMessageShown,
  setQuitMessageShown,
  hearts,
  onContinue,
}: {
  lessonStep: number;
  totalSteps: number;
  checkedKitParts: string[];
  setCheckedKitParts: React.Dispatch<React.SetStateAction<string[]>>;
  quitMessageShown: boolean;
  setQuitMessageShown: (isShown: boolean) => void;
  hearts: number | null;
  onContinue: () => void;
}) => {
  const allPartsChecked = checkedKitParts.length === kitParts.length;

  return (
    <LessonShell
      lessonStep={lessonStep}
      totalSteps={totalSteps}
      quitMessageShown={quitMessageShown}
      setQuitMessageShown={setQuitMessageShown}
      hearts={hearts}
      footer={
        <ContinueFooter disabled={!allPartsChecked} onContinue={onContinue} />
      }
    >
      <section className="flex max-w-2xl grow flex-col justify-center gap-6 self-center sm:px-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Busca estas piezas en tu kit
          </h1>
          <p className="mt-3 text-lg font-medium text-gray-500">
            Encuentra físicamente estas 4 piezas antes de continuar.
          </p>
        </div>
        <div className="grid gap-3">
          {kitParts.map((part) => {
            const isChecked = checkedKitParts.includes(part.name);
            return (
              <label
                key={part.name}
                className={
                  isChecked
                    ? "flex cursor-pointer items-center gap-4 rounded-xl border-2 border-b-4 border-[#00838f] bg-cyan-50 p-4 font-bold text-[#00838f]"
                    : "flex cursor-pointer items-center gap-4 rounded-xl border-2 border-b-4 border-gray-200 p-4 font-bold text-gray-700 hover:bg-gray-50"
                }
              >
                <input
                  type="checkbox"
                  className="h-6 w-6 accent-[#00acc1]"
                  checked={isChecked}
                  onChange={() =>
                    setCheckedKitParts((checkedParts) =>
                      isChecked
                        ? checkedParts.filter((name) => name !== part.name)
                        : [...checkedParts, part.name],
                    )
                  }
                />
                {part.name}
              </label>
            );
          })}
        </div>
      </section>
    </LessonShell>
  );
};

const MakerCheckAnswer = ({
  isAnswerSelected,
  isAnswerCorrect,
  correctAnswerShown,
  correctFeedback,
  incorrectFeedback,
  onCheckAnswer,
  onFinish,
}: {
  isAnswerSelected: boolean;
  isAnswerCorrect: boolean;
  correctAnswerShown: boolean;
  correctFeedback: string;
  incorrectFeedback: string;
  onCheckAnswer: () => void;
  onFinish: () => void;
}) => {
  return (
    <>
      <section className="border-gray-200 sm:border-t-2 sm:p-10">
        <div className="mx-auto flex max-w-5xl sm:justify-end">
          {!isAnswerSelected || correctAnswerShown ? (
            <button
              className="grow rounded-2xl bg-gray-200 p-3 font-bold uppercase text-gray-400 sm:min-w-[180px] sm:max-w-fit sm:grow-0"
              disabled
            >
              Comprobar
            </button>
          ) : (
            <button
              onClick={onCheckAnswer}
              className="grow rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] p-3 font-bold uppercase text-white sm:min-w-[180px] sm:max-w-fit sm:grow-0"
            >
              Comprobar
            </button>
          )}
        </div>
      </section>

      <div
        className={
          correctAnswerShown
            ? isAnswerCorrect
              ? "fixed bottom-0 left-0 right-0 bg-lime-100 font-bold text-green-600 transition-all"
              : "fixed bottom-0 left-0 right-0 bg-red-100 font-bold text-red-500 transition-all"
            : "fixed -bottom-52 left-0 right-0"
        }
      >
        <div className="flex max-w-5xl flex-col gap-4 p-5 sm:mx-auto sm:flex-row sm:items-center sm:justify-between sm:p-10 sm:py-14">
          <>
            {isAnswerCorrect ? (
              <div className="mb-2 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="hidden rounded-full bg-white p-5 text-green-500 sm:block">
                  <DoneSvg />
                </div>
                <div className="text-2xl">{correctFeedback}</div>
              </div>
            ) : (
              <div className="mb-2 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="hidden rounded-full bg-white p-5 text-red-500 sm:block">
                  <BigCloseSvg />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-2xl">{incorrectFeedback}</div>
                </div>
              </div>
            )}
          </>
          <button
            onClick={onFinish}
            className={
              isAnswerCorrect
                ? "w-full rounded-2xl border-b-4 border-green-600 bg-green-500 p-3 font-bold uppercase text-white transition hover:brightness-105 sm:min-w-[150px] sm:max-w-fit"
                : "w-full rounded-2xl border-b-4 border-red-600 bg-red-500 p-3 font-bold uppercase text-white transition hover:brightness-105 sm:min-w-[150px] sm:max-w-fit"
            }
          >
            Continuar
          </button>
        </div>
      </div>
    </>
  );
};

const MakerQuizStep = ({
  lessonStep,
  totalSteps,
  quiz,
  selectedAnswer,
  setSelectedAnswer,
  quitMessageShown,
  correctAnswerShown,
  setQuitMessageShown,
  isAnswerCorrect,
  onCheckAnswer,
  onFinish,
  hearts,
}: {
  lessonStep: number;
  totalSteps: number;
  quiz: MakerQuiz;
  selectedAnswer: string | null;
  setSelectedAnswer: React.Dispatch<React.SetStateAction<string | null>>;
  correctAnswerShown: boolean;
  quitMessageShown: boolean;
  setQuitMessageShown: (isShown: boolean) => void;
  isAnswerCorrect: boolean;
  onCheckAnswer: () => void;
  onFinish: () => void;
  hearts: number | null;
}) => {
  return (
    <LessonShell
      lessonStep={lessonStep}
      totalSteps={totalSteps}
      quitMessageShown={quitMessageShown}
      setQuitMessageShown={setQuitMessageShown}
      hearts={hearts}
      footer={
        <MakerCheckAnswer
          correctFeedback={quiz.correctFeedback}
          incorrectFeedback={quiz.incorrectFeedback}
          correctAnswerShown={correctAnswerShown}
          isAnswerCorrect={isAnswerCorrect}
          isAnswerSelected={selectedAnswer !== null}
          onCheckAnswer={onCheckAnswer}
          onFinish={onFinish}
        />
      }
    >
      <section className="flex max-w-2xl grow flex-col gap-5 self-center sm:items-center sm:justify-center sm:gap-16 sm:px-5">
        <h1 className="self-start text-2xl font-bold text-gray-800 sm:text-3xl">
          {quiz.question}
        </h1>
        <div
          className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
          role="radiogroup"
        >
          {quiz.options.map((answer) => {
            return (
              <button
                key={answer}
                className={
                  answer === selectedAnswer
                    ? "cursor-pointer rounded-xl border-2 border-b-4 border-[#00838f] bg-cyan-50 p-5 text-left text-xl font-bold text-[#00838f]"
                    : "cursor-pointer rounded-xl border-2 border-b-4 border-gray-200 p-5 text-left text-xl font-bold text-gray-700 hover:bg-gray-100"
                }
                role="radio"
                aria-checked={answer === selectedAnswer}
                onClick={() => {
                  if (!correctAnswerShown) {
                    setSelectedAnswer(answer);
                  }
                }}
              >
                {answer}
              </button>
            );
          })}
        </div>
      </section>
    </LessonShell>
  );
};

const LessonComplete = ({
  correctAnswerCount,
  incorrectAnswerCount,
  xpAward,
  startTime,
  endTime,
  reviewLessonShown,
  setReviewLessonShown,
  questionResults,
  pathId,
}: {
  correctAnswerCount: number;
  incorrectAnswerCount: number;
  xpAward: number;
  startTime: React.MutableRefObject<number>;
  endTime: React.MutableRefObject<number>;
  reviewLessonShown: boolean;
  setReviewLessonShown: React.Dispatch<React.SetStateAction<boolean>>;
  questionResults: QuestionResult[];
  pathId: LearningPathId;
}) => {
  const router = useRouter();
  const isPractice = "practice" in router.query;

  const increaseXp = useBoundStore((x) => x.increaseXp);
  const supabaseUserId = useBoundStore((x) => x.supabaseUserId);
  const lessonsCompletedForPath = useBoundStore(
    (x) => x.lessonsCompletedForPath,
  );
  const addToday = useBoundStore((x) => x.addToday);
  const increaseTeslas = useBoundStore((x) => x.increaseTeslas);
  const increaseLessonsCompleted = useBoundStore(
    (x) => x.increaseLessonsCompleted,
  );
  return (
    <div className="flex min-h-screen flex-col gap-5 px-4 py-5 sm:px-0 sm:py-0">
      <div className="flex grow flex-col items-center justify-center gap-8 font-bold">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-6xl">🤖</div>
          <h1 className="text-3xl text-yellow-400">¡Kit reconocido!</h1>
          <p className="max-w-xl text-lg text-gray-500">
            Ya conoces las piezas básicas. Ahora estás listo para empezar a
            construir.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          <div className="min-w-[110px] rounded-xl border-2 border-yellow-400 bg-yellow-400">
            <h2 className="py-1 text-center text-white">XP</h2>
            <div className="flex justify-center rounded-xl bg-white py-4 text-yellow-400">
              +{xpAward}
            </div>
          </div>
          <div className="min-w-[110px] rounded-xl border-2 border-[#00acc1] bg-[#00acc1]">
            <h2 className="py-1 text-center text-white">Tiempo</h2>
            <div className="flex justify-center rounded-xl bg-white py-4 text-[#00838f]">
              {formatTime(endTime.current - startTime.current)}
            </div>
          </div>
          <div className="min-w-[110px] rounded-xl border-2 border-green-400 bg-green-400">
            <h2 className="py-1 text-center text-white">Acierto</h2>
            <div className="flex justify-center rounded-xl bg-white py-4 text-green-400">
              {Math.round(
                (correctAnswerCount /
                  (correctAnswerCount + incorrectAnswerCount)) *
                  100,
              )}
              %
            </div>
          </div>
        </div>
      </div>
      <section className="border-gray-200 sm:border-t-2 sm:p-10">
        <div className="mx-auto flex max-w-5xl sm:justify-between">
          <button
            className="hidden rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-3 font-bold uppercase text-gray-400 transition hover:border-gray-300 hover:bg-gray-200 sm:block sm:min-w-[150px] sm:max-w-fit"
            onClick={() => setReviewLessonShown(true)}
          >
            Revisar lección
          </button>
          <Link
            className={
              "flex w-full items-center justify-center rounded-2xl border-b-4 border-green-600 bg-green-500 p-3 font-bold uppercase text-white transition hover:brightness-105 sm:min-w-[150px] sm:max-w-fit"
            }
            href={getLearnHref(pathId)}
            onClick={() => {
              const nextCompletedLessons = isPractice
                ? lessonsCompletedForPath(pathId)
                : lessonsCompletedForPath(pathId) + 1;
              increaseXp(xpAward);
              addToday();
              increaseTeslas(isPractice ? 0 : 1);
              if (!isPractice) {
                increaseLessonsCompleted(1, pathId);
              }
              if (supabaseUserId !== null) {
                void saveLearningProgress({
                  userId: supabaseUserId,
                  pathId,
                  completedLessons: nextCompletedLessons,
                  xp: nextCompletedLessons * makerLessonXp,
                });
              }
            }}
          >
            Terminar lección
          </Link>
        </div>
      </section>
      <ReviewLesson
        reviewLessonShown={reviewLessonShown}
        setReviewLessonShown={setReviewLessonShown}
        questionResults={questionResults}
      />
    </div>
  );
};

type QuestionResult = {
  question: string;
  yourResponse: string;
  correctResponse: string;
};

const ReviewLesson = ({
  reviewLessonShown,
  setReviewLessonShown,
  questionResults,
}: {
  reviewLessonShown: boolean;
  setReviewLessonShown: React.Dispatch<React.SetStateAction<boolean>>;
  questionResults: QuestionResult[];
}) => {
  const [selectedQuestionResult, setSelectedQuestionResult] =
    useState<null | QuestionResult>(null);
  return (
    <div
      className={[
        "fixed inset-0 flex items-center justify-center p-5 transition duration-300",
        reviewLessonShown ? "" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 bg-black",
          reviewLessonShown ? "opacity-75" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setReviewLessonShown(false)}
      ></div>
      <div className="relative flex w-full max-w-4xl flex-col gap-5 rounded-2xl border-2 border-gray-200 bg-white p-8">
        <button
          className="absolute -right-5 -top-5 rounded-full border-2 border-gray-200 bg-gray-100 p-1 text-gray-400 hover:brightness-90"
          onClick={() => setReviewLessonShown(false)}
        >
          <BigCloseSvg className="h-8 w-8" />
          <span className="sr-only">Cerrar</span>
        </button>
        <h2 className="text-center text-3xl">Revisa tus respuestas</h2>
        <p className="text-center text-xl text-gray-400">
          Toca una tarjeta para comparar tu respuesta con la correcta.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {questionResults.map((questionResult, i) => {
            return (
              <button
                key={i}
                className={[
                  "relative flex flex-col items-stretch gap-3 rounded-xl p-5 text-left",
                  questionResult.yourResponse === questionResult.correctResponse
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-500",
                ].join(" ")}
                onClick={() =>
                  setSelectedQuestionResult((selectedQuestionResult) =>
                    selectedQuestionResult === questionResult
                      ? null
                      : questionResult,
                  )
                }
              >
                <div className="flex justify-between gap-2">
                  <h3 className="font-bold">{questionResult.question}</h3>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                    {questionResult.yourResponse ===
                    questionResult.correctResponse ? (
                      <DoneSvg className="h-5 w-5" />
                    ) : (
                      <BigCloseSvg className="h-5 w-5" />
                    )}
                  </div>
                </div>
                <div>{questionResult.yourResponse}</div>
                {selectedQuestionResult === questionResult && (
                  <div className="absolute left-1 right-1 top-20 z-10 rounded-2xl border-2 border-gray-200 bg-white p-3 text-sm tracking-tighter">
                    <div
                      className="absolute -top-2 h-3 w-3 rotate-45 border-l-2 border-t-2 border-gray-200 bg-white"
                      style={{ left: "calc(50% - 6px)" }}
                    ></div>
                    <div className="font-bold uppercase text-gray-400">
                      Tu respuesta:
                    </div>
                    <div className="mb-3 text-gray-700">
                      {questionResult.yourResponse}
                    </div>
                    <div className="font-bold uppercase text-gray-400">
                      Respuesta correcta:
                    </div>
                    <div className="text-gray-700">
                      {questionResult.correctResponse}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LessonFastForwardStart = ({
  unitNumber,
  pathId,
  setIsStartingLesson,
}: {
  unitNumber: number;
  pathId: LearningPathId;
  setIsStartingLesson: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="flex min-h-screen flex-col px-5 py-8 text-center">
      <div className="flex grow flex-col items-center justify-center gap-5">
        <LessonFastForwardStartSvg />
        <h1 className="text-lg font-bold">
          ¿Quieres saltar a la Unidad {unitNumber}?
        </h1>
        <p className="text-sm text-gray-400">
          Supera la prueba para desbloquear esta parte de la ruta.
        </p>
      </div>
      <div className="flex flex-col gap-5"></div>
      <section className="border-gray-200 sm:border-t-2 sm:p-10">
        <div className="mx-auto flex max-w-5xl flex-col-reverse items-center gap-5 sm:flex-row sm:justify-between">
          <Link
            href={getLearnHref(pathId)}
            className="font-bold uppercase text-[#00acc1] transition hover:brightness-110"
          >
            Tal vez después
          </Link>
          <button
            className="w-full rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] p-3 font-bold uppercase text-white transition hover:brightness-110 sm:min-w-[150px] sm:max-w-fit"
            onClick={() => setIsStartingLesson(false)}
          >
            Vamos
          </button>
        </div>
      </section>
    </div>
  );
};

const LessonFastForwardEndFail = ({
  unitNumber,
  pathId,
  reviewLessonShown,
  setReviewLessonShown,
  questionResults,
}: {
  unitNumber: number;
  pathId: LearningPathId;
  reviewLessonShown: boolean;
  setReviewLessonShown: React.Dispatch<React.SetStateAction<boolean>>;
  questionResults: QuestionResult[];
}) => {
  return (
    <div className="flex min-h-screen flex-col px-5 py-8 text-center">
      <div className="flex grow flex-col items-center justify-center gap-5">
        <LessonFastForwardEndFailSvg />
        <h1 className="text-2xl font-bold">
          No desbloqueaste la Unidad {unitNumber}
        </h1>
        <p className="text-lg text-gray-500">
          Sigue practicando y vuelve a intentarlo.
        </p>
      </div>
      <section className="border-gray-200 sm:border-t-2 sm:p-10">
        <div className="mx-auto flex max-w-5xl sm:justify-between">
          <button
            className="hidden rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-3 font-bold uppercase text-gray-400 transition hover:border-gray-300 hover:bg-gray-200 sm:block sm:min-w-[150px] sm:max-w-fit"
            onClick={() => setReviewLessonShown(true)}
          >
            Revisar lección
          </button>
          <Link
            className="flex w-full items-center justify-center rounded-2xl border-b-4 border-green-600 bg-green-500 p-3 font-bold uppercase text-white transition hover:brightness-105 sm:min-w-[150px] sm:max-w-fit"
            href={getLearnHref(pathId)}
          >
            Continuar
          </Link>
        </div>
      </section>
      <ReviewLesson
        reviewLessonShown={reviewLessonShown}
        setReviewLessonShown={setReviewLessonShown}
        questionResults={questionResults}
      />
    </div>
  );
};

const LessonFastForwardEndPass = ({
  unitNumber,
  pathId,
  reviewLessonShown,
  setReviewLessonShown,
  questionResults,
}: {
  unitNumber: number;
  pathId: LearningPathId;
  reviewLessonShown: boolean;
  setReviewLessonShown: React.Dispatch<React.SetStateAction<boolean>>;
  questionResults: QuestionResult[];
}) => {
  const jumpToUnit = useBoundStore((x) => x.jumpToUnit);
  return (
    <div className="flex min-h-screen flex-col px-5 py-8 text-center">
      <div className="flex grow flex-col items-center justify-center gap-5">
        <LessonFastForwardEndPassSvg />
        <h1 className="text-2xl font-bold">
          ¡Desbloqueaste la Unidad {unitNumber}!
        </h1>
        <p className="text-lg text-gray-500">
          Buen trabajo. Tu ruta maker avanza.
        </p>
      </div>
      <section className="border-gray-200 sm:border-t-2 sm:p-10">
        <div className="mx-auto flex max-w-5xl sm:justify-between">
          <button
            className="hidden rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-3 font-bold uppercase text-gray-400 transition hover:border-gray-300 hover:bg-gray-200 sm:block sm:min-w-[150px] sm:max-w-fit"
            onClick={() => setReviewLessonShown(true)}
          >
            Revisar lección
          </button>
          <Link
            className="flex w-full items-center justify-center rounded-2xl border-b-4 border-green-600 bg-green-500 p-3 font-bold uppercase text-white transition hover:brightness-105 sm:min-w-[150px] sm:max-w-fit"
            href={getLearnHref(pathId)}
            onClick={() => jumpToUnit(unitNumber, pathId)}
          >
            Continuar
          </Link>
        </div>
      </section>
      <ReviewLesson
        reviewLessonShown={reviewLessonShown}
        setReviewLessonShown={setReviewLessonShown}
        questionResults={questionResults}
      />
    </div>
  );
};
