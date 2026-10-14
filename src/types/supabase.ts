import type { KitId } from "~/utils/kits";
import type { LearningPathId } from "~/utils/learningPaths";

export type UserRole = "student" | "teacher" | "school_admin";

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  avatar: string | null;
  created_at: string;
};

export type School = {
  id: string;
  name: string;
  code: string;
  created_at: string;
};

export type SchoolMember = {
  id: string;
  school_id: string;
  user_id: string;
  role: UserRole;
};

export type Classroom = {
  id: string;
  school_id: string;
  name: string;
  teacher_id: string;
  class_code: string;
  created_at: string;
};

export type ClassroomStudent = {
  id: string;
  classroom_id: string;
  student_id: string;
  joined_at: string;
};

export type LearningProgress = {
  id: string;
  user_id: string;
  path_id: LearningPathId;
  completed_lessons: number;
  xp: number;
  updated_at: string;
};

export type UserKit = {
  id: string;
  user_id: string;
  kit_id: KitId;
  unlocked_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          display_name: string;
          role?: UserRole;
          avatar?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      schools: {
        Row: School;
        Insert: {
          id?: string;
          name: string;
          code: string;
          created_at?: string;
        };
        Update: Partial<Omit<School, "id" | "created_at">>;
        Relationships: [];
      };
      school_members: {
        Row: SchoolMember;
        Insert: {
          id?: string;
          school_id: string;
          user_id: string;
          role: UserRole;
        };
        Update: Partial<Omit<SchoolMember, "id">>;
        Relationships: [];
      };
      classrooms: {
        Row: Classroom;
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          teacher_id: string;
          class_code: string;
          created_at?: string;
        };
        Update: Partial<Omit<Classroom, "id" | "created_at">>;
        Relationships: [];
      };
      classroom_students: {
        Row: ClassroomStudent;
        Insert: {
          id?: string;
          classroom_id: string;
          student_id: string;
          joined_at?: string;
        };
        Update: Partial<Omit<ClassroomStudent, "id" | "joined_at">>;
        Relationships: [];
      };
      learning_progress: {
        Row: LearningProgress;
        Insert: {
          id?: string;
          user_id: string;
          path_id: LearningPathId;
          completed_lessons?: number;
          xp?: number;
          updated_at?: string;
        };
        Update: Partial<Omit<LearningProgress, "id" | "user_id" | "path_id">>;
        Relationships: [];
      };
      user_kits: {
        Row: UserKit;
        Insert: {
          id?: string;
          user_id: string;
          kit_id: KitId;
          unlocked_at?: string;
        };
        Update: Partial<Omit<UserKit, "id" | "user_id" | "kit_id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      join_classroom_by_code: {
        Args: { join_code: string };
        Returns: Classroom[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
