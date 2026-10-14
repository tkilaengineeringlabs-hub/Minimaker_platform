import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getTeacherClassrooms, type RealClassroom } from "~/services/classroomService";
import { useBoundStore } from "~/hooks/useBoundStore";
import {
  getAveragePathProgress,
  getPathTotalLessons,
  getStudentPathProgress,
  getStudentProjectsCompleted,
  getStudentStatus,
  getUnitProgress,
  mockClassroom,
  type Student,
  type StudentStatus,
} from "~/utils/mockClassroom";
import { getKitById } from "~/utils/kits";
import {
  defaultLearningPathId,
  learningPaths,
  type LearningPath,
  type LearningPathId,
} from "~/utils/learningPaths";
import { getMakerLevel } from "~/utils/makerLevel";

type StatusFilter = "TODOS" | StudentStatus;
type SortBy = "PROGRESO" | "XP" | "NOMBRE";

const statusStyles: Record<StudentStatus, string> = {
  COMPLETADO: "bg-green-100 text-green-700",
  "EN PROGRESO": "bg-cyan-100 text-[#00838f]",
  "NECESITA AYUDA": "bg-yellow-100 text-yellow-700",
  "SIN INICIAR": "bg-gray-100 text-gray-500",
};

const Teacher: NextPage = () => {
  const supabaseUserId = useBoundStore((x) => x.supabaseUserId);
  const displayName = useBoundStore((x) => x.name);
  const [selectedPathId, setSelectedPathId] =
    useState<LearningPathId>(defaultLearningPathId);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("PROGRESO");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [realClassrooms, setRealClassrooms] = useState<RealClassroom[]>([]);
  const [loadingRealData, setLoadingRealData] = useState(false);
  const [realDataError, setRealDataError] = useState("");

  useEffect(() => {
    if (supabaseUserId === null) return;

    setLoadingRealData(true);
    void getTeacherClassrooms(supabaseUserId)
      .then((classrooms) => {
        setRealClassrooms(classrooms);
        setSelectedClassroomId((current) => current || classrooms[0]?.id || "");
      })
      .catch((error: unknown) => {
        console.error("Error al cargar grupos reales", error);
        setRealDataError(
          "No pudimos cargar los datos reales del profesor.",
        );
      })
      .finally(() => setLoadingRealData(false));
  }, [supabaseUserId]);

  const selectedRealClassroom =
    realClassrooms.find((classroom) => classroom.id === selectedClassroomId) ??
    realClassrooms[0];
  const classroomStudents =
    selectedRealClassroom !== undefined
      ? mapRealClassroomStudents(selectedRealClassroom)
      : mockClassroom.students;
  const classroomName = selectedRealClassroom?.name ?? mockClassroom.name;
  const teacherName =
    selectedRealClassroom !== undefined
      ? displayName || "Profesor"
      : mockClassroom.teacherName;
  const usingDemoData = selectedRealClassroom === undefined;

  const selectedPath =
    learningPaths.find((path) => path.id === selectedPathId) ??
    learningPaths[0];
  const averageProgress = getAveragePathProgress(
    classroomStudents,
    selectedPathId,
  );

  const studentsWithProgress = useMemo(() => {
    return classroomStudents.map((student) => {
      const progress = getStudentPathProgress(student, selectedPathId);
      const status = getStudentStatus({
        student,
        pathId: selectedPathId,
        averageProgress,
      });

      return { student, progress, status };
    });
  }, [averageProgress, classroomStudents, selectedPathId]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return studentsWithProgress
      .filter(({ student, status }) => {
        const matchesStatus =
          statusFilter === "TODOS" || status === statusFilter;
        const matchesSearch =
          normalizedSearch.length === 0 ||
          student.name.toLowerCase().includes(normalizedSearch);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "XP":
            return b.student.xp - a.student.xp;
          case "NOMBRE":
            return a.student.name.localeCompare(b.student.name);
          case "PROGRESO":
          default:
            return b.progress - a.progress;
        }
      });
  }, [search, sortBy, statusFilter, studentsWithProgress]);

  const groupStats = useMemo(() => {
    const totalXp = classroomStudents.reduce(
      (total, student) => total + student.xp,
      0,
    );
    const selectedPathLessons = classroomStudents.reduce(
      (total, student) => total + (student.progressByPath[selectedPathId] ?? 0),
      0,
    );
    const completedProjects = classroomStudents.reduce(
      (total, student) =>
        total + getStudentProjectsCompleted(student, selectedPathId),
      0,
    );

    return {
      studentCount: classroomStudents.length,
      totalXp,
      selectedPathLessons,
      completedProjects,
      averageProgress,
    };
  }, [averageProgress, classroomStudents, selectedPathId]);

  const alerts = buildTeacherAlerts({
    students: classroomStudents,
    pathId: selectedPathId,
    path: selectedPath,
    averageProgress,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b-2 border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[#00acc1]">
              {classroomName} · {teacherName} ·{" "}
              {usingDemoData ? "Modo demo" : "Datos reales"}
            </p>
            <h1 className="mt-1 text-3xl font-black text-gray-800">
              Panel del Profesor
            </h1>
            <p className="mt-1 text-lg font-medium text-gray-500">
              Sigue el progreso de tus Makers.
            </p>
          </div>
          <Link
            href="/profile"
            className="w-full rounded-2xl border-2 border-b-4 border-gray-200 bg-white px-5 py-3 text-center font-black uppercase text-gray-500 transition hover:bg-gray-50 sm:w-fit"
          >
            Volver al perfil
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 pb-12 sm:px-6">
        {loadingRealData && (
          <div className="rounded-2xl bg-white p-4 font-bold text-gray-500">
            Cargando grupos reales...
          </div>
        )}
        {realDataError !== "" && (
          <div className="rounded-2xl bg-yellow-50 p-4 font-bold text-yellow-700">
            {realDataError} Mostrando datos demo.
          </div>
        )}
        <GroupSummary stats={groupStats} />

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-5">
            {realClassrooms.length > 1 && (
              <ClassroomSelector
                classrooms={realClassrooms}
                selectedClassroomId={selectedRealClassroom?.id ?? ""}
                onSelectClassroom={setSelectedClassroomId}
              />
            )}
            <RouteSelector
              selectedPathId={selectedPathId}
              onSelectPath={setSelectedPathId}
            />
            <StudentControls
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              search={search}
              setSearch={setSearch}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <StudentList
              students={filteredStudents}
              selectedPathId={selectedPathId}
              onSelectStudent={setSelectedStudent}
            />
          </div>

          <TeacherAlerts alerts={alerts} />
        </section>
      </main>

      {selectedStudent !== null && selectedPath !== undefined && (
        <StudentDetailModal
          student={selectedStudent}
          selectedPath={selectedPath}
          averageProgress={averageProgress}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default Teacher;

const mapRealClassroomStudents = (classroom: RealClassroom): Student[] => {
  return classroom.students.map((student) => {
    const progressByPath = {
      fundamentos: 0,
      rover: 0,
      sensor: 0,
      smart: 0,
    };
    student.progress.forEach((progress) => {
      progressByPath[progress.path_id] = progress.completed_lessons;
    });
    const xp = student.progress.reduce((total, row) => total + row.xp, 0);

    return {
      id: student.profile.id,
      name: student.profile.display_name,
      avatar:
        student.profile.avatar ??
        student.profile.display_name.charAt(0).toUpperCase(),
      xp,
      streak: 0,
      unlockedKits: student.kits.map((kit) => kit.kit_id),
      progressByPath,
      lessonsCompleted: Object.values(progressByPath).reduce(
        (total, completed) => total + completed,
        0,
      ),
    };
  });
};

const ClassroomSelector = ({
  classrooms,
  selectedClassroomId,
  onSelectClassroom,
}: {
  classrooms: RealClassroom[];
  selectedClassroomId: string;
  onSelectClassroom: (classroomId: string) => void;
}) => {
  return (
    <section className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4 shadow-sm">
      <label className="grid gap-2 font-black text-gray-800">
        Grupo:
        <select
          className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 outline-none transition focus:border-[#00acc1]"
          value={selectedClassroomId}
          onChange={(event) => onSelectClassroom(event.target.value)}
        >
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
};

const GroupSummary = ({
  stats,
}: {
  stats: {
    totalXp: number;
    studentCount: number;
    selectedPathLessons: number;
    completedProjects: number;
    averageProgress: number;
  };
}) => {
  const cards = [
    { emoji: "👨‍🎓", label: "Alumnos", value: stats.studentCount },
    { emoji: "⚡", label: "XP total", value: stats.totalXp },
    {
      emoji: "📚",
      label: "Lecciones completadas",
      value: stats.selectedPathLessons,
    },
    {
      emoji: "🏆",
      label: "Proyectos terminados",
      value: stats.completedProjects,
    },
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="text-3xl">{card.emoji}</div>
            <div className="mt-3 text-2xl font-black text-gray-800">
              {card.value}
            </div>
            <div className="text-sm font-bold text-gray-500">{card.label}</div>
          </article>
        ))}
      </div>

      <article className="rounded-2xl border-2 border-b-4 border-[#00acc1] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-black uppercase text-[#00acc1]">
              Progreso promedio
            </div>
            <div className="mt-2 text-4xl font-black text-gray-800">
              {stats.averageProgress}%
            </div>
          </div>
          <div className="text-5xl">📈</div>
        </div>
        <ProgressBar progress={stats.averageProgress} />
      </article>
    </section>
  );
};

const RouteSelector = ({
  selectedPathId,
  onSelectPath,
}: {
  selectedPathId: LearningPathId;
  onSelectPath: (pathId: LearningPathId) => void;
}) => {
  return (
    <section className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black text-gray-800">Ver progreso de:</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {learningPaths.map((path) => {
          const selected = path.id === selectedPathId;

          return (
            <button
              key={path.id}
              className={[
                "rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-black transition",
                selected
                  ? "border-[#00838f] bg-[#00acc1] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
              ].join(" ")}
              onClick={() => onSelectPath(path.id)}
            >
              <span className="mr-2 text-2xl">{path.emoji}</span>
              {path.name}
            </button>
          );
        })}
      </div>
    </section>
  );
};

const StudentControls = ({
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  sortBy,
  setSortBy,
}: {
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  search: string;
  setSearch: (search: string) => void;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
}) => {
  const filters: StatusFilter[] = [
    "TODOS",
    "COMPLETADO",
    "EN PROGRESO",
    "NECESITA AYUDA",
    "SIN INICIAR",
  ];

  return (
    <section className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              className={[
                "rounded-full px-4 py-2 text-sm font-black uppercase transition",
                statusFilter === filter
                  ? "bg-[#00acc1] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200",
              ].join(" ")}
              onClick={() => setStatusFilter(filter)}
            >
              {filter === "TODOS" ? "Todos" : filter.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="rounded-2xl border-2 border-gray-200 px-4 py-3 font-bold text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#00acc1]"
            placeholder="Buscar alumno..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 outline-none transition focus:border-[#00acc1]"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortBy)}
          >
            <option value="PROGRESO">Ordenar por progreso</option>
            <option value="XP">Ordenar por XP</option>
            <option value="NOMBRE">Ordenar por nombre</option>
          </select>
        </div>
      </div>
    </section>
  );
};

const StudentList = ({
  students,
  selectedPathId,
  onSelectStudent,
}: {
  students: { student: Student; progress: number; status: StudentStatus }[];
  selectedPathId: LearningPathId;
  onSelectStudent: (student: Student) => void;
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border-2 border-b-4 border-gray-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[1.5fr_0.7fr_0.7fr_1.3fr_0.7fr_1fr] gap-4 border-b-2 border-gray-100 px-5 py-3 text-sm font-black uppercase text-gray-400 lg:grid">
        <div>Alumno</div>
        <div>XP</div>
        <div>Racha</div>
        <div>Progreso</div>
        <div>Lecciones</div>
        <div>Estado</div>
      </div>

      <div className="divide-y-2 divide-gray-100">
        {students.map(({ student, progress, status }) => (
          <button
            key={student.id}
            className="grid w-full gap-4 px-5 py-4 text-left transition hover:bg-cyan-50 lg:grid-cols-[1.5fr_0.7fr_0.7fr_1.3fr_0.7fr_1fr] lg:items-center"
            onClick={() => onSelectStudent(student)}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xl font-black text-[#00838f]">
                {student.avatar}
              </div>
              <div>
                <div className="font-black text-gray-800">{student.name}</div>
                <div className="text-sm font-bold text-gray-400 lg:hidden">
                  {student.xp} XP · 🔥 {student.streak}
                </div>
              </div>
            </div>
            <div className="hidden font-bold text-gray-700 lg:block">
              {student.xp} XP
            </div>
            <div className="hidden font-bold text-gray-700 lg:block">
              🔥 {student.streak}
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm font-black text-gray-500">
                <span className="lg:hidden">Progreso</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar progress={progress} />
            </div>
            <div className="font-bold text-gray-700">
              {student.progressByPath[selectedPathId] ?? 0}
            </div>
            <div>
              <span
                className={[
                  "inline-flex rounded-full px-3 py-1 text-xs font-black uppercase",
                  statusStyles[status],
                ].join(" ")}
              >
                {status}
              </span>
            </div>
          </button>
        ))}
      </div>

      {students.length === 0 && (
        <div className="px-5 py-10 text-center font-bold text-gray-500">
          No hay alumnos con esos filtros.
        </div>
      )}
    </section>
  );
};

const TeacherAlerts = ({ alerts }: { alerts: string[] }) => {
  return (
    <aside className="h-fit rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-gray-800">
        Atención del Profesor
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {alerts.map((alert) => (
          <div
            key={alert}
            className="rounded-2xl bg-slate-50 px-4 py-3 font-bold text-gray-600"
          >
            {alert}
          </div>
        ))}
      </div>
    </aside>
  );
};

const StudentDetailModal = ({
  student,
  selectedPath,
  averageProgress,
  onClose,
}: {
  student: Student;
  selectedPath: LearningPath;
  averageProgress: number;
  onClose: () => void;
}) => {
  const makerLevel = getMakerLevel(student.xp);
  const progress = getStudentPathProgress(student, selectedPath.id);
  const status = getStudentStatus({
    student,
    pathId: selectedPath.id,
    averageProgress,
  });
  const units = getUnitProgress(student, selectedPath.id);
  const unlockedKitNames = student.unlockedKits
    .map((kitId) => getKitById(kitId)?.name)
    .filter((name): name is string => name !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-3 sm:items-center sm:justify-center">
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Cerrar detalle"
      />
      <article className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-5 shadow-xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-2xl font-black text-[#00838f]">
              {student.avatar}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800">
                {student.name}
              </h2>
              <p className="font-bold text-gray-500">
                {makerLevel.name} · Nivel {makerLevel.levelNumber}
              </p>
            </div>
          </div>
          <button
            className="rounded-2xl border-2 border-b-4 border-gray-200 px-5 py-2 font-black uppercase text-gray-500 transition hover:bg-gray-50"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DetailStat label="XP" value={`${student.xp}`} emoji="⚡" />
          <DetailStat label="Racha" value={`${student.streak}`} emoji="🔥" />
          <DetailStat
            label="Kits"
            value={`${student.unlockedKits.length}`}
            emoji="🧰"
          />
          <DetailStat
            label="Proyectos"
            value={`${getStudentProjectsCompleted(student, selectedPath.id)}`}
            emoji="🏆"
          />
        </div>

        <section className="mt-5 rounded-2xl bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-800">
                {selectedPath.emoji} {selectedPath.name}
              </h3>
              <p className="font-bold text-gray-500">
                {student.progressByPath[selectedPath.id] ?? 0} de{" "}
                {getPathTotalLessons(selectedPath.id)} lecciones
              </p>
            </div>
            <span
              className={[
                "w-fit rounded-full px-3 py-1 text-xs font-black uppercase",
                statusStyles[status],
              ].join(" ")}
            >
              {status}
            </span>
          </div>
          <div className="mt-4">
            <div className="mb-2 text-right text-sm font-black text-gray-500">
              {progress}%
            </div>
            <ProgressBar progress={progress} />
          </div>
        </section>

        <section className="mt-5">
          <h3 className="text-lg font-black text-gray-800">Kits desbloqueados</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {unlockedKitNames.map((kitName) => (
              <span
                key={kitName}
                className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-black text-[#00838f]"
              >
                {kitName}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <h3 className="text-lg font-black text-gray-800">
            Unidades de la ruta
          </h3>
          <div className="mt-3 grid gap-3">
            {units.map((unit) => (
              <article
                key={unit.unitNumber}
                className="rounded-2xl border-2 border-gray-200 bg-white p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-gray-800">
                      Unidad {unit.unitNumber}
                    </div>
                    <div className="font-bold text-gray-500">
                      {unit.description}
                    </div>
                  </div>
                  <div className="font-black text-[#00acc1]">
                    {unit.progress}%
                  </div>
                </div>
                <ProgressBar progress={unit.progress} />
              </article>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};

const DetailStat = ({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) => {
  return (
    <article className="rounded-2xl border-2 border-gray-200 bg-white p-3">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 text-xl font-black text-gray-800">{value}</div>
      <div className="text-xs font-black uppercase text-gray-400">{label}</div>
    </article>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full rounded-full bg-[#00acc1] transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const buildTeacherAlerts = ({
  students,
  pathId,
  path,
  averageProgress,
}: {
  students: Student[];
  pathId: LearningPathId;
  path: LearningPath | undefined;
  averageProgress: number;
}): string[] => {
  const routeName = path?.name ?? "esta ruta";
  const lowProgressStudent = students.find(
    (student) =>
      getStudentStatus({ student, pathId, averageProgress }) ===
      "NECESITA AYUDA",
  );
  const notStartedStudent = students.find(
    (student) => getStudentPathProgress(student, pathId) === 0,
  );
  const strongStreakStudent = [...students].sort(
    (a, b) => b.streak - a.streak,
  )[0];
  const projectStudent = students.find(
    (student) => getStudentProjectsCompleted(student, pathId) > 0,
  );

  return [
    lowProgressStudent !== undefined
      ? `⚠ ${lowProgressStudent.name} lleva poco progreso en ${routeName}.`
      : undefined,
    notStartedStudent !== undefined
      ? `⚠ ${notStartedStudent.name} aún no ha iniciado ${routeName}.`
      : undefined,
    strongStreakStudent !== undefined && strongStreakStudent.streak >= 3
      ? `🔥 ${strongStreakStudent.name} lleva una racha de ${strongStreakStudent.streak} días.`
      : undefined,
    projectStudent !== undefined
      ? `🏆 ${projectStudent.name} completó un proyecto.`
      : undefined,
  ].filter((alert): alert is string => alert !== undefined);
};
