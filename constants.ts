import { AppState, ChatChannel, Resource, Skill, Specialization, Team, TestContext, TextContent, User } from './types';

export const DEFAULT_ADMIN_EMAIL = "ouarab.oussama@gmail.com";
export const DEFAULT_ADMIN_PASSWORD = "12345678";

export const TRANSLATIONS = {
  ar: {
    global: {
      platformTitle: "PICA - منصة التواصل التفاعلية",
      copyright: "© 2025 عمر أيت لوتو",
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      cancel: "إلغاء",
      save: "حفظ",
      edit: "تعديل",
      delete: "حذف",
      add: "إضافة",
      confirm: "تأكيد",
      close: "إغلاق",
      loading: "جار التحميل..."
    },
    nav: {
      home: "الرئيسية",
      dashboard: "لوحة المتدرب",
      texts: "النصوص والفهم",
      skills: "المهارات",
      presentations: "العروض",
      tests: "الاختبارات",
      chat: "الدردشة",
      resources: "المصادر",
      admin: "لوحة الإدارة"
    },
    home: {
      welcomeTitle: "أهلاً بكم في منصة التواصل التفاعلية",
      welcomeSubtitle: "فضاء رقمي لتعزيز مهارات التواصل الشفهي والكتابي للمتدربين.",
      featuresTitle: "مميزات المنصة",
      feature1: "نصوص تفاعلية",
      feature2: "تطوير المهارات",
      feature3: "تقييم ذكي"
    },
    texts: {
      title: "ركن النصوص والفهم",
      evaluateButton: "أجب الآن (تقييم بالذكاء الاصطناعي)",
      evaluationTitle: "تقييم فوري:",
      correctAnswer: "إجابة صحيحة!",
      incorrectAnswer: "إجابة خاطئة. حاول مرة أخرى.",
    },
    skills: {
      title: "المهارات المهنية والشخصية",
      practiceTitle: "تمرين على مهارة: {skillName}",
      scenario: "السيناريو",
      yourResponse: "إجابتك",
      submitForFeedback: "أرسل للحصول على تقييم",
      aiFeedback: "تقييم المساعد الذكي"
    },
    tests: {
      title: "فضاء الاختبارات",
      generateSmart: "إنشاء اختبار ذكي",
      startPrompt: "انقر لإنشاء اختبار قصير مولّد بالذكاء الاصطناعي.",
      questionOf: "السؤال {current} من {total}",
      quizComplete: "اكتمل الاختبار!",
      yourScore: "نتيجتك هي: {score} من {total}",
    }
  },
  fr: {
    global: {
      platformTitle: "PICA - Plateforme de Communication",
      copyright: "© 2025 Omar Ait Loutou",
      login: "Se connecter",
      logout: "Se déconnecter",
      cancel: "Annuler",
      save: "Enregistrer",
      edit: "Modifier",
      delete: "Supprimer",
      add: "Ajouter",
      confirm: "Confirmer",
      close: "Fermer",
      loading: "Chargement..."
    },
    nav: {
      home: "Accueil",
      dashboard: "Tableau de bord",
      texts: "Textes",
      skills: "Compétences",
      presentations: "Présentations",
      tests: "Tests",
      chat: "Chat",
      resources: "Ressources",
      admin: "Admin"
    },
    home: {
      welcomeTitle: "Bienvenue sur PICA",
      welcomeSubtitle: "Espace numérique pour renforcer vos compétences en communication.",
      featuresTitle: "Fonctionnalités",
      feature1: "Textes Interactifs",
      feature2: "Compétences",
      feature3: "Évaluation IA"
    },
    texts: {
      title: "Textes et Compréhension",
      evaluateButton: "Répondre (Évaluation IA)",
      evaluationTitle: "Évaluation instantanée :",
      correctAnswer: "Bonne réponse !",
      incorrectAnswer: "Mauvaise réponse.",
    },
    skills: {
      title: "Compétences Professionnelles",
      practiceTitle: "Exercice : {skillName}",
      scenario: "Scénario",
      yourResponse: "Votre réponse",
      submitForFeedback: "Soumettre",
      aiFeedback: "Feedback IA"
    },
    tests: {
      title: "Espace Tests",
      generateSmart: "Générer un test intelligent",
      startPrompt: "Cliquez pour générer un quiz IA.",
      questionOf: "Question {current} sur {total}",
      quizComplete: "Test terminé !",
      yourScore: "Votre score : {score} sur {total}",
    }
  }
};

// Initial Mock Data
export const INITIAL_TEXTS: TextContent[] = [
  {
    id: "1",
    title: { ar: "مقدمة في التواصل", fr: "Introduction à la communication" },
    specialization: { ar: "عام", fr: "Général" },
    content: {
      ar: "التواصل هو عملية تبادل المعلومات...",
      fr: "La communication est le processus d'échange d'informations..."
    },
    questions: []
  }
];

export const INITIAL_SKILLS: Skill[] = [
  { id: 1, title: { ar: "التفكير النقدي", fr: "Pensée Critique" }, description: { ar: "تحليل المعلومات", fr: "Analyser l'info" }, iconName: "LightBulbIcon" },
  { id: 2, title: { ar: "العمل الجماعي", fr: "Travail d'équipe" }, description: { ar: "التعاون مع الفريق", fr: "Collaborer" }, iconName: "UsersIcon" }
];

export const INITIAL_USERS: User[] = [
  { id: 1, name: "Admin User", email: DEFAULT_ADMIN_EMAIL, phone: "", specialization: "", role: "مدير", status: "نشط", password: DEFAULT_ADMIN_PASSWORD }
];

export const INITIAL_CHANNELS: ChatChannel[] = [
  {
    id: "general",
    name: { ar: "المساعد العام", fr: "Assistant Général" },
    iconName: "SparklesIcon",
    model: "gemini-3-pro-preview", // Defaulting to powerful model
    systemPrompt: { ar: "أنت مساعد ذكي...", fr: "Vous êtes un assistant IA..." },
    defaultSystemPrompt: { ar: "أنت مساعد ذكي...", fr: "Vous êtes un assistant IA..." }
  }
];

export const INITIAL_STATE: AppState = {
  user: null,
  users: INITIAL_USERS,
  texts: INITIAL_TEXTS,
  skills: INITIAL_SKILLS,
  teams: [],
  testContexts: [],
  chatChannels: INITIAL_CHANNELS,
  resources: [],
  specializations: [],
  progressData: [],
  completedSkills: []
};