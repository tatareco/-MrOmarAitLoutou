import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, AppState, Page, Lang, TextContent, Skill, Team, ChatChannel, Resource, Specialization, ProgressData } from './types';
import { TRANSLATIONS, INITIAL_STATE, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from './constants';
import { generateQuiz, evaluateAnswer, generateSkillScenario, evaluateSkillResponse, sendChatMessage } from './services/geminiService';
import { Button, Card, Spinner, Modal } from './components/UI';
import { HomeIcon, BookOpen, Sparkles, Presentation, FlaskConical, MessageCircle, Library, LayoutDashboard, Settings, LogOut, User as UserIcon, Menu, X, Moon, Sun } from 'lucide-react';

// --- Contexts ---
const AppContext = createContext<{
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
  darkMode: boolean;
  toggleDarkMode: () => void;
} | null>(null);

const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("Use AppContext within Provider");
  return ctx;
};

// --- Main Component ---
export default function App() {
  // Load state from local storage or init
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('pica_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [lang, setLang] = useState<Lang>('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('pica_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Helper for translations
  const t = (key: string) => {
    const keys = key.split('.');
    let val: any = TRANSLATIONS[lang];
    for (const k of keys) val = val?.[k];
    return val || key;
  };

  const handleLogout = () => {
    setState(s => ({ ...s, user: null }));
    setCurrentPage('home');
  };

  return (
    <AppContext.Provider value={{ state, setState, lang, setLang, t, darkMode, toggleDarkMode: () => setDarkMode(!darkMode) }}>
      <div className={`min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors font-sans`}>
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 z-50 w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')} lg:translate-x-0 lg:static`}>
          <div className="h-16 flex items-center justify-center border-b dark:border-slate-800">
            <h1 className="text-2xl font-bold text-primary-600">PICA</h1>
          </div>
          <nav className="p-4 space-y-2">
            <NavItem page="home" icon={<HomeIcon size={20} />} label={t('nav.home')} current={currentPage} set={setCurrentPage} close={() => setIsSidebarOpen(false)} />
            <NavItem page="dashboard" icon={<LayoutDashboard size={20} />} label={t('nav.dashboard')} current={currentPage} set={setCurrentPage} close={() => setIsSidebarOpen(false)} />
            <NavItem page="texts" icon={<BookOpen size={20} />} label={t('nav.texts')} current={currentPage} set={setCurrentPage} close={() => setIsSidebarOpen(false)} />
            <NavItem page="skills" icon={<Sparkles size={20} />} label={t('nav.skills')} current={currentPage} set={setCurrentPage} close={() => setIsSidebarOpen(false)} />
            <NavItem page="presentations" icon={<Presentation size={20} />} label={t('nav.presentations')} current={currentPage} set={setCurrentPage} close={() => setIsSidebarOpen(false)} />
            <NavItem page="tests" icon={<FlaskConical size={20} />} label={t('nav.tests')} current={currentPage} set={setCurrentPage} close={() => setIsSidebarOpen(false)} />
            <NavItem page="chat" icon={<MessageCircle size={20} />} label={t('nav.chat')} current={currentPage} set={setCurrentPage} close={() => setIsSidebarOpen(false)} />
            <NavItem page="resources" icon={<Library size={20} />} label={t('nav.resources')} current={currentPage} set={setCurrentPage} close={() => setIsSidebarOpen(false)} />
            {state.user?.role === 'مدير' && (
              <NavItem page="admin" icon={<Settings size={20} />} label={t('nav.admin')} current={currentPage} set={setCurrentPage} close={() => setIsSidebarOpen(false)} />
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-4 lg:px-8">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-4">
              <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} className="font-bold text-sm px-3 py-1 rounded bg-slate-100 dark:bg-slate-800">
                {lang === 'ar' ? 'FR' : 'AR'}
              </button>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {state.user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium hidden sm:inline">{state.user.name}</span>
                  <Button variant="secondary" onClick={handleLogout} className="!px-3 !py-1 text-sm">
                    <LogOut size={16} />
                  </Button>
                </div>
              ) : (
                 <LoginButton onSuccess={() => setCurrentPage('dashboard')} />
              )}
            </div>
          </header>
          
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {currentPage === 'home' && <HomeView />}
            {currentPage === 'dashboard' && <DashboardView />}
            {currentPage === 'texts' && <TextsView />}
            {currentPage === 'skills' && <SkillsView />}
            {currentPage === 'tests' && <TestsView />}
            {currentPage === 'chat' && <ChatView />}
            {currentPage === 'admin' && state.user?.role === 'مدير' && <AdminView />}
            {/* Placeholders for other views */}
            {['presentations', 'resources'].includes(currentPage) && (
              <div className="flex items-center justify-center h-64 text-slate-500">Feature coming soon...</div>
            )}
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
}

const NavItem = ({ page, icon, label, current, set, close }: any) => (
  <button
    onClick={() => { set(page); close(); }}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${current === page ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// --- Views ---

const HomeView = () => {
  const { t } = useAppContext();
  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-primary-600 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-4">{t('home.welcomeTitle')}</h2>
        <p className="text-lg opacity-90">{t('home.welcomeSubtitle')}</p>
      </section>
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6 text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {i === 1 ? <BookOpen /> : i === 2 ? <Sparkles /> : <FlaskConical />}
            </div>
            <h3 className="font-bold text-xl mb-2">{t(`home.feature${i}`)}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
};

const DashboardView = () => {
  const { state, t } = useAppContext();
  if (!state.user) return <LoginRequired />;
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('nav.dashboard')}</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard title={t('nav.texts')} value={0} icon={<BookOpen />} />
        <StatCard title={t('nav.skills')} value={0} icon={<Sparkles />} />
        <StatCard title={t('nav.tests')} value="0%" icon={<FlaskConical />} />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: any) => (
  <Card className="p-6 flex items-center gap-4">
    <div className="p-3 rounded-full bg-primary-50 dark:bg-slate-800 text-primary-600">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </Card>
);

const TextsView = () => {
  const { state, lang, t } = useAppContext();
  const [selectedText, setSelectedText] = useState<TextContent | null>(null);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string>('');

  if (!state.user) return <LoginRequired />;

  const handleGenerateQuiz = async (text: TextContent) => {
    setLoading(true);
    try {
      // Using Thinking Mode for generation
      const q = await generateQuiz(text.content[lang]);
      setQuiz(q);
    } catch (e) {
      alert("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (question: string, answer: string) => {
    setLoading(true);
    try {
      // Using Thinking Mode for evaluation
      const fb = await evaluateAnswer(selectedText!.content[lang], question, answer);
      setFeedback(fb || "");
    } catch (e) {
      alert("Failed to evaluate");
    } finally {
      setLoading(false);
    }
  };

  if (selectedText) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => { setSelectedText(null); setQuiz([]); setFeedback(''); }}>← Back</Button>
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">{selectedText.title[lang]}</h2>
          <div className="prose dark:prose-invert max-w-none mb-8">
             <p>{selectedText.content[lang]}</p>
          </div>
          
          <div className="border-t dark:border-slate-700 pt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Interactive Quiz</h3>
              <Button onClick={() => handleGenerateQuiz(selectedText)} isLoading={loading}>
                 {t('tests.generateSmart')} (Thinking Mode)
              </Button>
            </div>

            {quiz.length > 0 && (
               <div className="space-y-6">
                 {quiz.map((q, i) => (
                   <div key={i} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                     <p className="font-semibold mb-3">{i+1}. {q.question}</p>
                     <div className="space-y-2">
                       {q.options.map((opt: string, j: number) => (
                         <label key={j} className="flex items-center gap-2 p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                           <input type="radio" name={`q-${i}`} />
                           <span>{opt}</span>
                         </label>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Open Evaluation</h3>
              <p className="mb-2">Question: Summarize the main idea.</p>
              <textarea 
                className="w-full p-3 rounded-lg border dark:bg-slate-900 dark:border-slate-700 mb-2" 
                rows={3}
                onChange={(e) => setAnswers({...answers, open: e.target.value})}
              />
              <Button 
                onClick={() => handleEvaluate("Summarize the main idea", answers.open)}
                isLoading={loading}
              >
                Evaluate Answer (Thinking Mode)
              </Button>
              {feedback && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
                  <strong>AI Feedback:</strong> {feedback}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {state.texts.map(text => (
        <Card key={text.id} className="p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelectedText(text)}>
          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">{text.specialization[lang]}</span>
          <h3 className="text-xl font-bold mt-2 mb-2">{text.title[lang]}</h3>
          <p className="text-slate-500 line-clamp-3">{text.content[lang]}</p>
        </Card>
      ))}
    </div>
  );
};

const SkillsView = () => {
  const { state, lang, t } = useAppContext();
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  if (!state.user) return <LoginRequired />;

  const startPractice = async (skill: Skill) => {
    setActiveSkill(skill);
    setLoading(true);
    try {
      // Thinking Mode
      const s = await generateSkillScenario(skill.title[lang], skill.description[lang], state.user?.specialization || "General");
      setScenario(s);
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    setLoading(true);
    try {
      // Thinking Mode
      const fb = await evaluateSkillResponse(activeSkill!.title[lang], scenario.scenario, response);
      setFeedback(fb || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('nav.skills')}</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {state.skills.map(skill => (
          <Card key={skill.id} className="p-6">
            <h3 className="font-bold text-lg mb-2">{skill.title[lang]}</h3>
            <p className="text-slate-500 mb-4">{skill.description[lang]}</p>
            <Button onClick={() => startPractice(skill)} className="w-full">Practice (Thinking)</Button>
          </Card>
        ))}
      </div>

      <Modal isOpen={!!activeSkill} onClose={() => { setActiveSkill(null); setScenario(null); setFeedback(""); setResponse(""); }} title={t('skills.practiceTitle').replace('{skillName}', activeSkill?.title[lang] || '')}>
        {loading && !scenario && <div className="text-center py-8"><Spinner /></div>}
        {scenario && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2">{t('skills.scenario')}</h4>
              <p>{scenario.scenario}</p>
              <p className="font-bold mt-2 text-primary-600">{scenario.question}</p>
            </div>
            
            <textarea 
              className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-700"
              rows={4}
              placeholder={t('skills.yourResponse')}
              value={response}
              onChange={e => setResponse(e.target.value)}
            />

            <Button onClick={submitResponse} isLoading={loading} disabled={!response}>
              {t('skills.submitForFeedback')}
            </Button>

            {feedback && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-green-800 dark:text-green-200 animate-fade-in">
                <h4 className="font-bold mb-2">{t('skills.aiFeedback')}</h4>
                <p className="whitespace-pre-wrap">{feedback}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const TestsView = () => {
  const { t, lang } = useAppContext();
  // Reusing Quiz Generation logic here essentially
  return (
    <div className="text-center py-12">
      <FlaskConical size={48} className="mx-auto text-primary-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">{t('tests.title')}</h2>
      <p className="text-slate-500 mb-6">{t('tests.startPrompt')}</p>
      <Button onClick={() => alert("Uses Thinking Mode (see Texts View example)")}>
        {t('tests.generateSmart')}
      </Button>
    </div>
  );
}

const ChatView = () => {
  const { state, lang, t } = useAppContext();
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3-pro-preview");

  if (!state.user) return <LoginRequired />;

  const send = async () => {
    if (!input.trim()) return;
    const newMsg = { role: "user", text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
      const response = await sendChatMessage(selectedModel, history, input);
      setMessages(prev => [...prev, { role: "model", text: response || "Error" }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "model", text: "Error connecting to AI." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('nav.chat')}</h2>
        <select 
          value={selectedModel} 
          onChange={(e) => setSelectedModel(e.target.value)}
          className="p-2 rounded border dark:bg-slate-800 dark:border-slate-700 text-sm"
        >
          <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
          <option value="gemini-3-pro-preview">Gemini 3 Pro (Thinking Mode)</option>
        </select>
      </div>
      
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-4 overflow-y-auto space-y-4 mb-4 shadow-inner">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${m.role === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 rounded-bl-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg rounded-bl-none"><Spinner size="sm"/></div></div>}
      </div>

      <div className="flex gap-2">
        <input 
          className="flex-1 p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary-500"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
        />
        <Button onClick={send} disabled={!input.trim() || loading}>Send</Button>
      </div>
    </div>
  );
};

const AdminView = () => {
  // Basic Admin Placeholder
  const { state } = useAppContext();
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-bold text-xl">{state.users?.length || 0}</h3>
          <p className="text-slate-500">Users</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold text-xl">{state.texts?.length || 0}</h3>
          <p className="text-slate-500">Texts</p>
        </Card>
      </div>
    </div>
  );
}

const LoginRequired = () => {
  const { t } = useAppContext();
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <LogOut size={48} className="text-slate-300 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Login Required</h2>
      <p className="text-slate-500 mb-6">Please sign in to access this content.</p>
    </div>
  );
}

const LoginButton = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setState, t } = useAppContext();

  const handleLogin = () => {
    if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      setState(s => ({ 
        ...s, 
        user: { id: 1, name: "Admin", email, role: 'مدير', status: 'نشط', phone: '', specialization: '' } 
      }));
      setIsOpen(false);
      onSuccess();
    } else {
      // Simulation for trainee
      setState(s => ({ 
        ...s, 
        user: { id: 2, name: "Trainee", email, role: 'متدرب', status: 'نشط', phone: '', specialization: 'General' } 
      }));
      setIsOpen(false);
      onSuccess();
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{t('global.login')}</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('global.login')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input className="w-full p-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Password</label>
            <input type="password" className="w-full p-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button onClick={handleLogin} className="w-full">{t('global.login')}</Button>
        </div>
      </Modal>
    </>
  );
}
