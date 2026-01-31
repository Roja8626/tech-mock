import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  LayoutDashboard, 
  History, 
  LogOut, 
  PlusCircle, 
  Trash2, 
  BrainCircuit, 
  Loader2,
  XCircle,
  Menu,
  X,
  Play
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { User, Question, TestResult, UserRole, AuthState } from './types';
import { StorageService } from './services/storage';
import { generateQuestions } from './services/geminiService';

// --- Components ---

const Layout: React.FC<{ children: React.ReactNode; user: User | null; logout: () => void }> = ({ children, user, logout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => (
    <button
      onClick={() => {
        navigate(path);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors w-full md:w-auto ${
        isActive(path) 
          ? 'bg-blue-100 text-blue-700 font-medium' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TechMock</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              {user?.role === UserRole.STUDENT && (
                <>
                  <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                  <NavItem path="/history" icon={History} label="History" />
                </>
              )}
              {user?.role === UserRole.ADMIN && (
                <NavItem path="/admin" icon={BrainCircuit} label="Admin Panel" />
              )}
              <div className="border-l border-gray-200 h-6 mx-2"></div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500 uppercase tracking-wide">{user?.role}</span>
                <button onClick={logout} className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-2 shadow-lg">
            {user?.role === UserRole.STUDENT && (
              <>
                <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem path="/history" icon={History} label="History" />
              </>
            )}
            {user?.role === UserRole.ADMIN && (
              <NavItem path="/admin" icon={BrainCircuit} label="Admin Panel" />
            )}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="flex items-center justify-between px-4 py-2">
                 <div className="flex flex-col">
                   <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                   <span className="text-xs text-gray-500">{user?.role}</span>
                 </div>
                 <button onClick={logout} className="text-red-600 text-sm font-medium">Log Out</button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

// --- Pages ---

const Login: React.FC<{ setAuth: (u: User) => void }> = ({ setAuth }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegistering) {
      if (!name || !email) {
        setError("Name and Email are required");
        return;
      }
      const user = StorageService.register(name, email, role);
      setAuth(user);
    } else {
      if (!email) {
        setError("Email is required");
        return;
      }
      const user = StorageService.login(email);
      if (user) {
        setAuth(user);
      } else {
        setError("User not found. Please register.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 px-8 py-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full">
               <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-blue-100 text-center mt-2">
            Technical Mock Test Simulator
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          
          {isRegistering && (
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          {isRegistering && (
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.STUDENT)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                    role === UserRole.STUDENT 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.ADMIN)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                    role === UserRole.ADMIN
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-colors"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-sm text-blue-600 hover:underline"
            >
              {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [history, setHistory] = useState<TestResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(StorageService.getUserHistory(user.id));
  }, [user.id]);

  const avgScore = history.length > 0 
    ? Math.round((history.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / history.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hello, {user.name} 👋</h1>
        <p className="text-gray-600 mt-2">Ready to test your technical skills today?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Tests Taken</h3>
            <div className="bg-blue-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{history.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Average Score</h3>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgScore}%</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Start New Mock Test</h3>
            <p className="text-sm opacity-75 mt-1">Simulate a real exam environment.</p>
          </div>
          <button 
            onClick={() => navigate('/test')}
            className="mt-4 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
          >
             <Play size={18} fill="currentColor" />
             <span>Start Now</span>
          </button>
        </div>
      </div>

      <div className="mt-8">
         <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
         {history.length === 0 ? (
           <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
             <div className="inline-flex bg-gray-50 p-4 rounded-full mb-4">
                <History className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No tests taken yet</h3>
             <p className="text-gray-500 mt-1">Take your first test to see analytics here.</p>
           </div>
         ) : (
           <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {history.slice(0, 5).map((test) => (
                   <tr key={test.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                       {new Date(test.timestamp).toLocaleDateString()}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                       {test.score} / {test.totalQuestions}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (test.score / test.totalQuestions) >= 0.7 ? 'bg-green-100 text-green-800' : 
                          (test.score / test.totalQuestions) >= 0.4 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round((test.score / test.totalQuestions) * 100)}%
                        </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <button 
                         onClick={() => navigate(`/result/${test.id}`)}
                         className="text-blue-600 hover:text-blue-900"
                       >
                         View Details
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
      </div>
    </div>
  );
};

const TakeTest: React.FC<{ user: User }> = ({ user }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading a "random" set of questions
    const allQuestions = StorageService.getQuestions();
    // Shuffle and pick 10 (or less if fewer exist)
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 10));
    setLoading(false);
  }, []);

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    if (questions.length === 0) return;

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctOptionIndex) {
        score++;
      }
    });

    const result: TestResult = {
      id: Date.now().toString(),
      userId: user.id,
      timestamp: Date.now(),
      score,
      totalQuestions: questions.length,
      answers,
      questionIds: questions.map(q => q.id)
    };

    StorageService.saveTestResult(result);
    navigate(`/result/${result.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Sticky Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-20 z-10 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Technical Assessment</h2>
          <div className="flex items-center space-x-2 mt-1">
             <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
             </div>
             <span className="text-xs text-gray-500 font-medium">{answeredCount}/{questions.length} answered</span>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={answeredCount < questions.length}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            answeredCount === questions.length 
             ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
             : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Submit Test
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 font-semibold text-sm">
                {idx + 1}
              </span>
              <div className="flex-grow">
                 <h3 className="text-lg text-gray-900 font-medium mb-4">{q.text}</h3>
                 <div className="space-y-2">
                   {q.options.map((opt, optIdx) => (
                     <button
                       key={optIdx}
                       onClick={() => handleAnswer(q.id, optIdx)}
                       className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                         answers[q.id] === optIdx
                           ? 'border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500'
                           : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                       }`}
                     >
                       <div className="flex items-center">
                         <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                           answers[q.id] === optIdx ? 'border-blue-500' : 'border-gray-400'
                         }`}>
                           {answers[q.id] === optIdx && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                         </div>
                         {opt}
                       </div>
                     </button>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TestResultPage: React.FC = () => {
  const { id } = React.useMemo(() => {
      // Very basic param extraction since we are using HashRouter
      const path = window.location.hash.split('/');
      return { id: path[path.length - 1] };
  }, [window.location.hash]); // Crude way to get ID, in real router we use useParams
  
  // Actually, useParams works in HashRouter too.
  const params = React.useMemo(() => {
     const h = window.location.hash;
     const parts = h.split('/');
     return parts[parts.length-1];
  }, []);

  const [result, setResult] = useState<TestResult | null>(null);
  const [questionsMap, setQuestionsMap] = useState<Record<string, Question>>({});
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, we'd fetch specific result.
    // Here we scan local storage for the result ID.
    const allResults = JSON.parse(localStorage.getItem('techmock_results') || '[]') as TestResult[];
    const found = allResults.find(r => r.id === params);
    
    if (found) {
      setResult(found);
      const allQs = StorageService.getQuestions();
      const map: Record<string, Question> = {};
      allQs.forEach(q => map[q.id] = q);
      setQuestionsMap(map);
    }
  }, [params]);

  if (!result) return <div className="p-8 text-center text-gray-500">Loading result...</div>;

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const isPass = percentage >= 70;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className={`text-center p-8 rounded-2xl ${isPass ? 'bg-green-50' : 'bg-red-50'} border ${isPass ? 'border-green-100' : 'border-red-100'}`}>
        <div className={`inline-flex items-center justify-center p-4 rounded-full mb-4 ${isPass ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isPass ? <CheckCircle size={48} /> : <XCircle size={48} />}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          You scored {result.score} / {result.totalQuestions}
        </h1>
        <p className={`text-lg font-medium ${isPass ? 'text-green-700' : 'text-red-700'}`}>
          {isPass ? 'Great Job! You Passed.' : 'Keep practicing. You can do better!'}
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-6 px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 shadow-sm transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Review Answers</h2>
        {result.questionIds.map((qId, idx) => {
          const question = questionsMap[qId];
          if (!question) return null;
          
          const userAns = result.answers[qId];
          const correctAns = question.correctOptionIndex;
          const isCorrect = userAns === correctAns;

          return (
            <div key={qId} className={`bg-white p-6 rounded-xl border shadow-sm ${isCorrect ? 'border-gray-200' : 'border-red-200'}`}>
              <div className="flex gap-4">
                 <div className="flex-shrink-0 pt-1">
                   <span className="text-sm font-bold text-gray-500">Q{idx+1}</span>
                 </div>
                 <div className="flex-grow">
                   <p className="text-gray-900 font-medium mb-4">{question.text}</p>
                   <div className="space-y-2">
                     {question.options.map((opt, optIdx) => {
                       let style = "border-gray-200 text-gray-600";
                       let icon = null;

                       if (optIdx === correctAns) {
                         style = "border-green-500 bg-green-50 text-green-800";
                         icon = <CheckCircle size={16} className="text-green-600 ml-auto" />;
                       } else if (optIdx === userAns && !isCorrect) {
                         style = "border-red-500 bg-red-50 text-red-800";
                         icon = <XCircle size={16} className="text-red-600 ml-auto" />;
                       }

                       return (
                         <div key={optIdx} className={`px-4 py-3 rounded-lg border text-sm flex items-center ${style}`}>
                           {opt}
                           {icon}
                         </div>
                       )
                     })}
                   </div>
                   {!isCorrect && (
                     <div className="mt-3 text-sm text-red-600 flex items-center">
                       <span className="font-semibold mr-1">Your Answer:</span> {question.options[userAns]}
                     </div>
                   )}
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HistoryPage: React.FC<{ user: User }> = ({ user }) => {
  const [history, setHistory] = useState<TestResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const data = StorageService.getUserHistory(user.id);
    // Reverse for chart (oldest to newest)
    setHistory(data);
  }, [user.id]);

  const chartData = [...history].reverse().map((h, i) => ({
    name: `Test ${i + 1}`,
    score: Math.round((h.score / h.totalQuestions) * 100),
    date: new Date(h.timestamp).toLocaleDateString()
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Performance History</h1>

      {history.length > 0 ? (
        <>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Score Trend (%)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  itemStyle={{ color: '#2563EB' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2563EB" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {history.map((test) => {
                   const pct = (test.score / test.totalQuestions);
                   return (
                   <tr key={test.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                       {new Date(test.timestamp).toLocaleDateString()} <span className="text-gray-400 text-xs ml-1">{new Date(test.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                       {test.score} / {test.totalQuestions}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pct >= 0.7 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {pct >= 0.7 ? 'Pass' : 'Fail'}
                        </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <button 
                         onClick={() => navigate(`/result/${test.id}`)}
                         className="text-blue-600 hover:text-blue-900"
                       >
                         View
                       </button>
                     </td>
                   </tr>
                 )})}
               </tbody>
             </table>
           </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No history found</h3>
          <p className="text-gray-500">You haven't taken any tests yet.</p>
        </div>
      )}
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Manual Add Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);
  const [newQCategory, setNewQCategory] = useState('');

  const loadQuestions = useCallback(() => {
    setQuestions(StorageService.getQuestions());
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleGenerate = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);
    try {
      const newQs = await generateQuestions(aiTopic, 5);
      StorageService.addQuestions(newQs);
      loadQuestions();
      setAiTopic('');
    } catch (e) {
      alert("Failed to generate questions. Check API Key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      StorageService.deleteQuestion(id);
      loadQuestions();
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText || newQOptions.some(o => !o)) return;

    const q: Question = {
      id: `manual-${Date.now()}`,
      text: newQText,
      options: newQOptions,
      correctOptionIndex: newQCorrect,
      category: newQCategory || 'General'
    };

    StorageService.addQuestions([q]);
    loadQuestions();
    setIsAdding(false);
    // Reset
    setNewQText('');
    setNewQOptions(['', '', '', '']);
    setNewQCorrect(0);
    setNewQCategory('');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Question Bank Management</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isAdding ? <X size={18} /> : <PlusCircle size={18} />}
          <span>{isAdding ? 'Cancel' : 'Add Question'}</span>
        </button>
      </div>

      {/* AI Generator */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-100 p-6 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-grow">
            <h3 className="text-indigo-900 font-semibold flex items-center gap-2">
              <BrainCircuit size={20} />
              AI Question Generator
            </h3>
            <p className="text-indigo-700 text-sm mt-1">
              Automatically generate questions using Gemini API.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              type="text" 
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g. React Hooks, Python Lists..."
              className="flex-grow md:w-64 px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !aiTopic}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Manual Add Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
          <h3 className="font-bold text-gray-900 mb-4">Add New Question</h3>
          <form onSubmit={handleManualAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
              <textarea 
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newQOptions.map((opt, idx) => (
                <div key={idx}>
                   <label className="block text-xs font-medium text-gray-500 mb-1">Option {idx + 1}</label>
                   <div className="flex items-center">
                     <input 
                       required
                       type="radio" 
                       name="correct" 
                       checked={newQCorrect === idx}
                       onChange={() => setNewQCorrect(idx)}
                       className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                     />
                     <input
                       type="text"
                       required
                       className="flex-grow px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                       value={opt}
                       onChange={(e) => {
                         const newOpts = [...newQOptions];
                         newOpts[idx] = e.target.value;
                         setNewQOptions(newOpts);
                       }}
                     />
                   </div>
                </div>
              ))}
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
               <input 
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newQCategory}
                  onChange={(e) => setNewQCategory(e.target.value)}
                  placeholder="General"
               />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">Save Question</button>
            </div>
          </form>
        </div>
      )}

      {/* Question List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{q.text}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {q.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main App Logic ---

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for persisted session
    const user = StorageService.getCurrentUser();
    if (user) {
      setAuthState({ user, isAuthenticated: true });
    }
    setLoading(false);
  }, []);

  const login = (user: User) => {
    setAuthState({ user, isAuthenticated: true });
  };

  const logout = () => {
    StorageService.logout();
    setAuthState({ user: null, isAuthenticated: false });
  };

  if (loading) return null;

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={
          !authState.isAuthenticated ? <Login setAuth={login} /> : <Navigate to="/dashboard" />
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={
           authState.isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />

        <Route path="/dashboard" element={
          authState.isAuthenticated ? (
            <Layout user={authState.user} logout={logout}>
              {authState.user?.role === UserRole.ADMIN ? <Navigate to="/admin" /> : <Dashboard user={authState.user!} />}
            </Layout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/test" element={
          authState.isAuthenticated ? (
            <Layout user={authState.user} logout={logout}>
              <TakeTest user={authState.user!} />
            </Layout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/result/:id" element={
          authState.isAuthenticated ? (
            <Layout user={authState.user} logout={logout}>
              <TestResultPage />
            </Layout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/history" element={
          authState.isAuthenticated ? (
            <Layout user={authState.user} logout={logout}>
              <HistoryPage user={authState.user!} />
            </Layout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/admin" element={
          authState.isAuthenticated && authState.user?.role === UserRole.ADMIN ? (
            <Layout user={authState.user} logout={logout}>
              <AdminPanel />
            </Layout>
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </HashRouter>
  );
}

export default App;
