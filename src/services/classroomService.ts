import { supabase } from "~/lib/supabase";
import type {
  Classroom,
  LearningProgress,
  Profile,
  School,
  SchoolMember,
  UserKit,
} from "~/types/supabase";

export type RealClassroomStudent = {
  profile: Profile;
  progress: LearningProgress[];
  kits: UserKit[];
};

export type RealClassroom = Classroom & {
  students: RealClassroomStudent[];
};

type ClassroomStudentRow = {
  student_id: string;
};

type SchoolMemberRow = SchoolMember & {
  profiles: Profile | null;
};

type SchoolClassroomRow = Classroom & {
  profiles: Profile | null;
  classroom_students: { student_id: string }[] | null;
};

export type SchoolOverview = {
  school: School;
  members: SchoolMemberRow[];
  classrooms: SchoolClassroomRow[];
};

export const getTeacherClassrooms = async (
  teacherId: string,
): Promise<RealClassroom[]> => {
  if (supabase === null) return [];

  const { data: classrooms, error } = await supabase
    .from("classrooms")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at");

  if (error !== null) {
    console.error("Error loading teacher classrooms", error.message);
    return [];
  }

  const realClassrooms = await Promise.all(
    classrooms.map(async (classroom) => {
      const students = await getClassroomStudents(classroom.id);
      return { ...classroom, students };
    }),
  );

  return realClassrooms;
};

export const getClassroomStudents = async (
  classroomId: string,
): Promise<RealClassroomStudent[]> => {
  if (supabase === null) return [];

  const { data, error } = await supabase
    .from("classroom_students")
    .select("student_id")
    .eq("classroom_id", classroomId)
    .order("joined_at");

  if (error !== null) {
    console.error("Error loading classroom students", error.message);
    return [];
  }

  const rows: ClassroomStudentRow[] = data;
  const students = await Promise.all(
    rows.map(async (row) => {
      const profile = await getProfileById(row.student_id);
      if (profile === null) return null;

      const [progress, kits] = await Promise.all([
        getStudentProgress(row.student_id),
        getStudentKits(row.student_id),
      ]);

      return { profile, progress, kits };
    }),
  );

  return students.filter(
    (student): student is RealClassroomStudent => student !== null,
  );
};

export const joinClassroomByCode = async (
  classCode: string,
): Promise<{ ok: true; classroom: Classroom } | { ok: false; message: string }> => {
  if (supabase === null) {
    return { ok: false, message: "Supabase no está configurado." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    return { ok: false, message: "Inicia sesión para unirte a una clase." };
  }

  const { data, error: classroomError } = await supabase.rpc(
    "join_classroom_by_code",
    { join_code: classCode.trim().toUpperCase() },
  );
  const classroom = data?.[0];

  if (classroomError !== null || classroom === undefined) {
    return { ok: false, message: "No encontramos una clase con ese código." };
  }

  return { ok: true, classroom };
};

export const getSchoolOverview = async (
  userId: string,
): Promise<SchoolOverview | null> => {
  if (supabase === null) return null;

  const { data: member, error: memberError } = await supabase
    .from("school_members")
    .select("*")
    .eq("user_id", userId)
    .eq("role", "school_admin")
    .maybeSingle();

  if (memberError !== null || member === null) {
    console.error("Error loading school membership", memberError?.message);
    return null;
  }

  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .select("*")
    .eq("id", member.school_id)
    .maybeSingle();

  if (schoolError !== null) {
    console.error("Error loading school", schoolError.message);
  }
  if (school === null) return null;

  const [
    { data: members },
    { data: classrooms },
    { data: classroomStudents },
  ] = await Promise.all([
    supabase
      .from("school_members")
      .select("*")
      .eq("school_id", school.id)
      .order("role"),
    supabase
      .from("classrooms")
      .select("*")
      .eq("school_id", school.id)
      .order("created_at"),
    supabase.from("classroom_students").select("classroom_id, student_id"),
  ]);
  const profiles = await getProfilesByIds([
    ...(members ?? []).map((row) => row.user_id),
    ...(classrooms ?? []).map((row) => row.teacher_id),
  ]);
  const getProfile = (profileId: string) =>
    profiles.find((profile) => profile.id === profileId) ?? null;

  return {
    school,
    members: (members ?? []).map((row) => ({
      ...row,
      profiles: getProfile(row.user_id),
    })),
    classrooms: (classrooms ?? []).map((row) => ({
      ...row,
      profiles: getProfile(row.teacher_id),
      classroom_students:
        classroomStudents
          ?.filter((student) => student.classroom_id === row.id)
          .map((student) => ({ student_id: student.student_id })) ?? [],
    })),
  };
};

export const createClassroom = async ({
  schoolId,
  name,
  teacherId,
  classCode,
}: {
  schoolId: string;
  name: string;
  teacherId: string;
  classCode: string;
}): Promise<{ ok: true } | { ok: false; message: string }> => {
  if (supabase === null) {
    return { ok: false, message: "Supabase no está configurado." };
  }

  const { error } = await supabase.from("classrooms").insert({
    school_id: schoolId,
    name,
    teacher_id: teacherId,
    class_code: classCode.trim().toUpperCase(),
  });

  if (error !== null) return { ok: false, message: error.message };

  return { ok: true };
};

export const getStudentProgress = async (
  studentId: string,
): Promise<LearningProgress[]> => {
  if (supabase === null) return [];

  const { data, error } = await supabase
    .from("learning_progress")
    .select("*")
    .eq("user_id", studentId);

  if (error !== null) {
    console.error("Error loading student progress", error.message);
    return [];
  }

  return data;
};

export const getStudentKits = async (studentId: string): Promise<UserKit[]> => {
  if (supabase === null) return [];

  const { data, error } = await supabase
    .from("user_kits")
    .select("*")
    .eq("user_id", studentId);

  if (error !== null) {
    console.error("Error loading student kits", error.message);
    return [];
  }

  return data;
};

export const getProfileFromRelation = (
  value: Profile | null,
): Profile | null => value;

const getProfileById = async (profileId: string): Promise<Profile | null> => {
  if (supabase === null) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error !== null) {
    console.error("Error loading student profile", error.message);
    return null;
  }

  return data;
};

const getProfilesByIds = async (profileIds: string[]): Promise<Profile[]> => {
  if (supabase === null || profileIds.length === 0) return [];

  const uniqueProfileIds = [...new Set(profileIds)];
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", uniqueProfileIds);

  if (error !== null) {
    console.error("Error loading profiles", error.message);
    return [];
  }

  return data;
};
