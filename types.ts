export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  role: 'متدرب' | 'أستاذ' | 'مدير';
  status: 'نشط' | 'غير نشط';
  password?: string;
  mustChangePassword?: boolean;
  photoURL?: string;
}

export interface LocalizedText {
  ar: string;
  fr: string;
}

export interface QuestionOption {
  id: string;
  text: LocalizedText;
}

export interface Question {
  id: string;
  text: LocalizedText;
  type: string;
  options?: QuestionOption[];
  correctAnswerId?: string;
}

export interface TextContent {
  id: string;
  title: LocalizedText;
  specialization: LocalizedText;
  content: LocalizedText;
  questions: Question[];
}

export interface Skill {
  id: number;
  title: LocalizedText;
  description: LocalizedText;
  iconName: string;
}

export interface Team {
  id: number;
  name: LocalizedText;
  specialization: LocalizedText;
  members: string[];
  presentation: string | null;
  presentationData: string | null;
  presentationTitle: LocalizedText;
  dueDate: string;
  teamLeader: string;
}

export interface TestContext {
  id: string;
  title: LocalizedText;
  content: LocalizedText;
}

export interface ChatChannel {
  id: string;
  name: LocalizedText;
  iconName: string;
  model: string;
  systemPrompt: LocalizedText;
  defaultSystemPrompt: LocalizedText;
}

export interface Resource {
  id: string;
  title: LocalizedText;
  type: LocalizedText;
  link: string;
}

export interface Specialization {
  id: string;
  name: LocalizedText;
  traineeCount: number;
}

export interface ProgressData {
  month: string;
  completedTexts: number;
  acquiredSkills: number;
  testScores: number;
}

export type Lang = 'ar' | 'fr';

export type Page = 'home' | 'dashboard' | 'texts' | 'skills' | 'presentations' | 'tests' | 'chat' | 'resources' | 'admin';

export interface AppState {
  user: User | null;
  users: User[];
  texts: TextContent[];
  skills: Skill[];
  teams: Team[];
  testContexts: TestContext[];
  chatChannels: ChatChannel[];
  resources: Resource[];
  specializations: Specialization[];
  progressData: ProgressData[];
  completedSkills: number[];
}