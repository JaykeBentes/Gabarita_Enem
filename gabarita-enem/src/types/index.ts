export interface User {
  id: number;
  name: string;
  email: string;
  birthDate: string;
  memberSince?: string;
  avatarUrl?: string;
}

export interface Question {
  title: string;
  index: number;
  discipline: string;
  language?: string;
  year: number;
  context?: string;
  files?: string[];
  correctAlternative: string;
  alternativesIntroduction?: string;
  alternatives: Alternative[];
}

export interface Alternative {
  letter: string;
  text?: string;
  file?: string;
  isCorrect: boolean;
}

export interface Simulation {
  id?: number;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  timeElapsed: number;
  scorePercentage: number;
  answers?: any[];
  questions?: Question[];
  createdAt?: string;
}

export interface Performance {
  generalStats: {
    totalSimulations: number;
    averageScore: number;
    totalHours: number;
    evolution: string;
  };
  subjectPerformance: {
    name: string;
    score: number;
  }[];
  strongPoints: string[];
  improvementAreas: string[];
}

export interface HistoryItem {
  subject: string;
  score: string;
  grade: string;
  gradeColor: string;
  date: string;
}