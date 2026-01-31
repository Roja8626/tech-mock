export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number; // 0-3
  category: string;
}

export interface TestResult {
  id: string;
  userId: string;
  timestamp: number;
  score: number;
  totalQuestions: number;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  questionIds: string[]; // Store order of questions
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
