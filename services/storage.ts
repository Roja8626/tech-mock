import { User, Question, TestResult, UserRole } from '../types';

const KEYS = {
  USERS: 'techmock_users',
  QUESTIONS: 'techmock_questions',
  RESULTS: 'techmock_results',
  CURRENT_USER: 'techmock_current_user',
};

// Seed Data
const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'What is the time complexity of searching in a balanced Binary Search Tree?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
    correctOptionIndex: 1,
    category: 'Data Structures'
  },
  {
    id: 'q2',
    text: 'Which of the following is NOT a JavaScript data type?',
    options: ['Symbol', 'Boolean', 'Integer', 'Undefined'],
    correctOptionIndex: 2,
    category: 'JavaScript'
  },
  {
    id: 'q3',
    text: 'In React, what hook is used to handle side effects?',
    options: ['useState', 'useReducer', 'useEffect', 'useMemo'],
    correctOptionIndex: 2,
    category: 'React'
  },
  {
    id: 'q4',
    text: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Question Language', 'System Query Logic', 'Standard Query List'],
    correctOptionIndex: 0,
    category: 'Databases'
  }
];

// Helper to get from local storage
const getList = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveList = <T>(key: string, list: T[]) => {
  localStorage.setItem(key, JSON.stringify(list));
};

export const StorageService = {
  // Auth & Users
  login: (email: string): User | null => {
    const users = getList<User>(KEYS.USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: (name: string, email: string, role: UserRole): User => {
    const users = getList<User>(KEYS.USERS);
    const newUser: User = { id: Date.now().toString(), name, email, role };
    users.push(newUser);
    saveList(KEYS.USERS, users);
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  // Questions
  getQuestions: (): Question[] => {
    let questions = getList<Question>(KEYS.QUESTIONS);
    if (questions.length === 0) {
      questions = INITIAL_QUESTIONS;
      saveList(KEYS.QUESTIONS, questions);
    }
    return questions;
  },

  addQuestions: (newQuestions: Question[]) => {
    const current = getList<Question>(KEYS.QUESTIONS);
    const updated = [...current, ...newQuestions];
    saveList(KEYS.QUESTIONS, updated);
  },

  deleteQuestion: (id: string) => {
    const current = getList<Question>(KEYS.QUESTIONS);
    const updated = current.filter(q => q.id !== id);
    saveList(KEYS.QUESTIONS, updated);
  },

  // Results
  saveTestResult: (result: TestResult) => {
    const results = getList<TestResult>(KEYS.RESULTS);
    results.push(result);
    saveList(KEYS.RESULTS, results);
  },

  getUserHistory: (userId: string): TestResult[] => {
    const results = getList<TestResult>(KEYS.RESULTS);
    return results.filter(r => r.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
  }
};
