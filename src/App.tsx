/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, RotateCcw, Award, CheckCircle2, XCircle, Search, 
  Trash2, FileText, BarChart2, GraduationCap, 
  Layers, Settings, ArrowRight, ArrowLeft, Clock,
  BookOpen, Plus, Info, RefreshCw, Check, X, Share2, LogIn, LogOut, ExternalLink, HelpCircle
} from 'lucide-react';
import { Question, QuestionType, StudentAttempt } from './types';
import { QUESTIONS } from './questionsData';
import { QuestionVisual } from './components/QuestionVisual';
import { 
  loadAttempts, 
  saveAttempt, 
  resetAttempts, 
  isAnswerCorrect, 
  calculateCategoryScores 
} from './utils/quizUtils';
import { initAuth, googleSignIn, logout } from './utils/googleAuth';
import { createGoogleFormQuiz } from './utils/googleFormsApi';

// Reference to our generated blueprint banner
const BANNER_URL = '/src/assets/images/relay_blueprint_banner_1783512532255.jpg';

export default function App() {
  // Navigation & Role states
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [stage, setStage] = useState<'welcome' | 'quiz' | 'results'>('welcome');
  
  // Student quiz states
  const [studentName, setStudentName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: number]: any }>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [quizDuration, setQuizDuration] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<any>(null);
  const [latestAttempt, setLatestAttempt] = useState<StudentAttempt | null>(null);

  // Lecturer states
  const [attemptsList, setAttemptsList] = useState<StudentAttempt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');
  const [selectedAttempt, setSelectedAttempt] = useState<StudentAttempt | null>(null);

  // Google Forms integration states
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [createdForm, setCreatedForm] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize Google Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Create Google Form Quiz action
  const handleCreateGoogleForm = async () => {
    setFormError(null);
    setCreatedForm(null);
    let currentToken = googleToken;

    if (!currentToken) {
      try {
        const result = await googleSignIn();
        if (result) {
          currentToken = result.accessToken;
          setGoogleUser(result.user);
          setGoogleToken(result.accessToken);
        } else {
          setFormError('Не вдалося авторизуватись через Google API.');
          return;
        }
      } catch (err: any) {
        setFormError(`Помилка авторизації: ${err.message || err}`);
        return;
      }
    }

    if (!currentToken) return;

    setIsCreatingForm(true);
    try {
      const result = await createGoogleFormQuiz(currentToken, 'Тест на тему: Електромагнітні реле (test1rele)');
      setCreatedForm(result);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Помилка генерації форми.');
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setGoogleUser(null);
    setGoogleToken(null);
    setCreatedForm(null);
    setFormError(null);
  };

  // Load lecturer attempts on component mount
  useEffect(() => {
    setAttemptsList(loadAttempts());
  }, []);

  // Handle timer
  useEffect(() => {
    if (stage === 'quiz' && startTime) {
      const interval = setInterval(() => {
        setQuizDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    }
  }, [stage, startTime]);

  // Start Quiz trigger
  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStartTime(Date.now());
    setQuizDuration(0);
    setStage('quiz');
  };

  // Answer handler for Single choice
  const handleSingleAnswer = (questionId: number, optionIdx: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  // Answer handler for Multiple choice
  const handleMultipleAnswer = (questionId: number, optionIdx: number) => {
    const current = answers[questionId] || [];
    let updated: number[];
    if (current.includes(optionIdx)) {
      updated = current.filter((idx: number) => idx !== optionIdx);
    } else {
      updated = [...current, optionIdx];
    }
    setAnswers(prev => ({
      ...prev,
      [questionId]: updated
    }));
  };

  // Answer handler for Table matching
  const handleTableAnswer = (questionId: number, rowIndex: number, colIndex: number) => {
    const current = answers[questionId] || {};
    const updated = {
      ...current,
      [rowIndex]: colIndex
    };
    setAnswers(prev => ({
      ...prev,
      [questionId]: updated
    }));
  };

  // Submit test
  const handleSubmitQuiz = () => {
    const score = QUESTIONS.reduce((acc, q) => {
      return acc + (isAnswerCorrect(q, answers[q.id]) ? 1 : 0);
    }, 0);

    const categoryScores = calculateCategoryScores(QUESTIONS, answers);

    const attemptData = {
      studentName: studentName.trim(),
      score,
      answers,
      durationSeconds: quizDuration,
      categoryScores
    };

    const saved = saveAttempt(attemptData);
    setLatestAttempt(saved);
    setAttemptsList(loadAttempts()); // reload lecturer logs
    setStage('results');
  };

  // Helper formatting for time
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} хв ${seconds} с`;
  };

  // Lecturer mock commands
  const handleResetLecturerLogs = (keepSeeds: boolean) => {
    const updated = resetAttempts(keepSeeds);
    setAttemptsList(updated);
    setSelectedAttempt(null);
  };

  const handleAddRandomAttempt = () => {
    const names = ['Сергій Коваль', 'Олена Мороз', 'Іван Ткаченко', 'Анна Лисенко', 'Віталій Савченко', 'Світлана Бойко'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomScore = Math.floor(Math.random() * 5) + 6; // score 6-10
    
    // Generate simulated answers
    const simAnswers: { [qId: number]: any } = {};
    QUESTIONS.forEach(q => {
      if (q.type === QuestionType.SINGLE) {
        simAnswers[q.id] = Math.random() > 0.3 ? q.correctAnswerIndex : (q.correctAnswerIndex + 1) % 3;
      } else if (q.type === QuestionType.MULTIPLE) {
        simAnswers[q.id] = Math.random() > 0.3 ? q.correctAnswerIndices : [0, 1];
      } else {
        simAnswers[q.id] = Math.random() > 0.3 ? { 0: 0, 1: 1, 2: 2 } : { 0: 0, 1: 2, 2: 1 };
      }
    });

    const categoryScores = calculateCategoryScores(QUESTIONS, simAnswers);
    const finalScore = QUESTIONS.reduce((acc, q) => {
      return acc + (isAnswerCorrect(q, simAnswers[q.id]) ? 1 : 0);
    }, 0);

    const saved = saveAttempt({
      studentName: randomName,
      score: finalScore,
      answers: simAnswers,
      durationSeconds: Math.floor(Math.random() * 200) + 200,
      categoryScores
    });

    setAttemptsList(loadAttempts());
  };

  // Sorting lecturer attempts
  const sortedAttempts = [...attemptsList]
    .filter(a => a.studentName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'name') return a.studentName.localeCompare(b.studentName);
      // default by timestamp date
      return b.timestamp.localeCompare(a.timestamp);
    });

  // Lecturer statistics calculations
  const totalAttemptsCount = attemptsList.length;
  const avgScore = totalAttemptsCount > 0 
    ? (attemptsList.reduce((acc, a) => acc + a.score, 0) / totalAttemptsCount).toFixed(1) 
    : '0';
  const avgTime = totalAttemptsCount > 0 
    ? Math.round(attemptsList.reduce((acc, a) => acc + a.durationSeconds, 0) / totalAttemptsCount)
    : 0;

  // Calculate success rates per subtopic
  const topicStats: { [topic: string]: { correct: number; total: number } } = {
    'Принцип дії': { correct: 0, total: 0 },
    'Типи контактів': { correct: 0, total: 0 },
    'Призначення та застосування': { correct: 0, total: 0 },
    'Кількість контактів': { correct: 0, total: 0 },
  };

  attemptsList.forEach(att => {
    Object.keys(att.categoryScores || {}).forEach(topic => {
      if (topicStats[topic]) {
        topicStats[topic].correct += att.categoryScores[topic].correct;
        topicStats[topic].total += att.categoryScores[topic].total;
      }
    });
  });

  // Calculate correct-answer rate per question ID (1 to 10)
  const questionSuccessRates = QUESTIONS.map(q => {
    if (totalAttemptsCount === 0) return 0;
    const correctCount = attemptsList.filter(att => isAnswerCorrect(q, att.answers[q.id])).length;
    return Math.round((correctCount / totalAttemptsCount) * 100);
  });

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.id];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans lab-grid selection:bg-cyan-500 selection:text-slate-950">
      
      {/* HEADER / VIRTUAL INSTRUMENT PANEL */}
      <header className="border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur sticky top-0 z-40 shadow-lg shadow-cyan-950/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xl font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              🎛️
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider font-display text-cyan-400 uppercase sm:text-base">
                ЛАБОРАТОРНИЙ СТЕНД №4
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                ТЕМАТИЧНЕ ТЕСТУВАННЯ: ЕЛЕКТРОМАГНІТНІ РЕЛЕ
              </p>
            </div>
          </div>

          {/* Device Telemetry / Status Controls */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setRole('student');
                // Don't interrupt active quiz unless they confirm, but let's toggle safely
              }}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                role === 'student'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              СТУДЕНТ
            </button>
            <button
              onClick={() => {
                setRole('lecturer');
              }}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                role === 'lecturer'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              ЛЕКТОР (АНАЛІТИКА)
            </button>
          </div>

          {/* Quick Telemetry Indicators */}
          <div className="hidden lg:flex items-center gap-4 font-mono text-xs text-slate-500 border-l border-slate-800 pl-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>СТЕНД: ОНЛАЙН</span>
            </div>
            <div>
              <span>СКЛАДНІСТЬ: 4/10</span>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        
        {/* ROLE: STUDENT */}
        {role === 'student' && (
          <AnimatePresence mode="wait">
            
            {/* STAGE: WELCOME / SIGN IN */}
            {stage === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
              >
                {/* Banner wrapper */}
                <div className="h-48 md:h-64 relative bg-slate-950 overflow-hidden border-b border-slate-800">
                  <img 
                    src={BANNER_URL} 
                    alt="Електромагнітне реле" 
                    className="w-full h-full object-cover opacity-65"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono rounded font-bold tracking-widest uppercase">
                      Вступний інструктаж
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100 mt-1">
                      Тема: Фізика та архітектура реле
                    </h2>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col gap-2">
                      <span className="text-amber-400 text-lg">💡</span>
                      <h3 className="text-xs font-bold font-mono text-slate-300 uppercase">Охоплення теми</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Принцип дії котушки, типи контактів (NO/NC/CO), гальванічна розвʼязка та позначення SPST, SPDT, DPDT.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col gap-2">
                      <span className="text-cyan-400 text-lg">📋</span>
                      <h3 className="text-xs font-bold font-mono text-slate-300 uppercase">Формат запитань</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Тест містить 10 запитань трьох типів: один варіант, множинний вибір та інтерактивні таблиці відповідностей.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col gap-2">
                      <span className="text-emerald-400 text-lg">⚙️</span>
                      <h3 className="text-xs font-bold font-mono text-slate-300 uppercase">Візуальна лабораторія</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Кожне запитання супроводжується інтерактивною векторною схемою, яку можна вмикати для наочності.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleStartQuiz} className="max-w-md mx-auto space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="student-name-input" className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Прізвище та імʼя студента
                      </label>
                      <input
                        id="student-name-input"
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="напр. Олександр Коваленко"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium transition-all text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      id="btn-start-quiz"
                      disabled={!studentName.trim()}
                      className="w-full py-3.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-display rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      РОЗПОЧАТИ ТЕСТУВАННЯ
                    </button>
                    <p className="text-[10px] text-center text-slate-500 font-mono">
                      Рівень складності: Середній (4/10). Професійні терміни та формули спрощено.
                    </p>
                  </form>
                </div>
              </motion.div>
            )}

            {/* STAGE: QUIZ PASSING */}
            {stage === 'quiz' && currentQuestion && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid lg:grid-cols-12 gap-6 items-start"
              >
                
                {/* Left Side: Question card */}
                <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md space-y-6">
                  
                  {/* Status header inside quiz */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-950 text-cyan-400 border border-slate-800 text-xs font-mono rounded">
                        Тема: {currentQuestion.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {formatTime(quizDuration)}
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-cyan-400 font-bold">
                        Запитання {currentQuestionIndex + 1} з {QUESTIONS.length}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/50">
                    <div 
                      className="bg-cyan-500 h-full transition-all duration-300" 
                      style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
                    ></div>
                  </div>

                  {/* Question text */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest block">
                      {currentQuestion.type === QuestionType.SINGLE && '● ОДИН ПРАВИЛЬНИЙ ВАРІАНТ'}
                      {currentQuestion.type === QuestionType.MULTIPLE && '▤ МНОЖИННИЙ ВИБІР (ОБЕРІТЬ УСІ)'}
                      {currentQuestion.type === QuestionType.TABLE && '⊞ ТАБЛИЦЯ ВІДПОВІДНОСТЕЙ (ОБЕРІТЬ ДЛЯ КОЖНОГО РЯДКА)'}
                    </span>
                    <h3 className="text-lg md:text-xl font-medium tracking-tight text-slate-100">
                      {currentQuestion.questionText}
                    </h3>
                  </div>

                  {/* Question Inputs renderer */}
                  <div className="pt-2">
                    {/* SINGLE CHOICE */}
                    {currentQuestion.type === QuestionType.SINGLE && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                          const isSelected = currentAnswer === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSingleAnswer(currentQuestion.id, idx)}
                              className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-500/10 border-cyan-500 text-slate-100 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-700'
                              }`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-slate-950"></div>}
                              </div>
                              <span className="text-sm font-medium">{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* MULTIPLE CHOICE */}
                    {currentQuestion.type === QuestionType.MULTIPLE && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                          const selectedArr = currentAnswer || [];
                          const isSelected = selectedArr.includes(idx);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleMultipleAnswer(currentQuestion.id, idx)}
                              className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-500/10 border-cyan-500 text-slate-100 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-700'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className="text-sm font-medium">{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* TABLE MATCHING GRID */}
                    {currentQuestion.type === QuestionType.TABLE && (
                      <div className="space-y-6">
                        
                        {/* Tablet/Desktop Grid */}
                        <div className="hidden sm:block overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-950 text-slate-400 text-xs font-mono uppercase tracking-wider border-b border-slate-800">
                              <tr>
                                <th className="p-4 w-1/3">Параметр реле</th>
                                {currentQuestion.columns.map((col, cIdx) => (
                                  <th key={cIdx} className="p-4 text-center text-[10px] leading-tight max-w-[120px]">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {currentQuestion.rows.map((row, rIdx) => {
                                const rowAnswer = currentAnswer || {};
                                const selectedCol = rowAnswer[rIdx];

                                return (
                                  <tr key={rIdx} className="hover:bg-slate-900/20">
                                    <td className="p-4 font-medium text-slate-300 text-xs leading-relaxed">
                                      {row}
                                    </td>
                                    {currentQuestion.columns.map((_, cIdx) => {
                                      const isCellChecked = selectedCol === cIdx;
                                      return (
                                        <td key={cIdx} className="p-4 text-center">
                                          <button
                                            type="button"
                                            onClick={() => handleTableAnswer(currentQuestion.id, rIdx, cIdx)}
                                            className={`w-6 h-6 rounded-full border mx-auto flex items-center justify-center transition-all cursor-pointer ${
                                              isCellChecked 
                                                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                                                : 'border-slate-700 text-slate-600 hover:border-slate-500'
                                            }`}
                                          >
                                            {isCellChecked && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>}
                                          </button>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Stack layout for Tables */}
                        <div className="block sm:hidden space-y-4">
                          {currentQuestion.rows.map((row, rIdx) => {
                            const rowAnswer = currentAnswer || {};
                            const selectedCol = rowAnswer[rIdx];

                            return (
                              <div key={rIdx} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
                                <span className="text-xs font-mono text-cyan-400 block border-b border-slate-800 pb-1.5 font-bold">
                                  Елемент: {row}
                                </span>
                                <div className="space-y-2">
                                  {currentQuestion.columns.map((col, cIdx) => {
                                    const isSelected = selectedCol === cIdx;
                                    return (
                                      <button
                                        key={cIdx}
                                        type="button"
                                        onClick={() => handleTableAnswer(currentQuestion.id, rIdx, cIdx)}
                                        className={`w-full p-2.5 text-xs rounded-lg border text-left flex items-center gap-2 transition-all ${
                                          isSelected
                                            ? 'bg-cyan-500/10 border-cyan-500 text-slate-100'
                                            : 'bg-slate-900/30 border-slate-800 text-slate-400'
                                        }`}
                                      >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                          isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-700'
                                        }`}>
                                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>}
                                        </div>
                                        <span>{col}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Navigation Footer within active quiz */}
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      НАЗАД
                    </button>

                    {currentQuestionIndex < QUESTIONS.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-mono font-bold text-xs flex items-center gap-2 transition-all border border-slate-700 cursor-pointer"
                      >
                        НАСТУПНЕ
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-display font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                      >
                        ЗАВЕРШИТИ ТЕСТ ТА ОЦІНИТИ
                        <Award className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>

                {/* Right Side: Interactive schematics visualizer */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 shadow-md backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-3 font-mono">
                      <Info className="w-4 h-4 text-cyan-400" />
                      <span>ІНТЕРАКТИВНИЙ АНАЛОГОВИЙ ЕМУЛЯТОР</span>
                    </div>
                    <QuestionVisual questionId={currentQuestion.id} userAnswer={currentAnswer} />
                    <p className="text-[10px] text-slate-500 font-mono mt-3 text-center leading-relaxed">
                      Ви можете інтерактивно керувати цією схемою у реальному часі, щоб побачити логіку її комутації.
                    </p>
                  </div>
                </div>

              </motion.div>
            )}

            {/* STAGE: QUICK RESULTS (STUDENT ONLY VIEW) */}
            {stage === 'results' && latestAttempt && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                
                {/* Result Hero Header */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  <div className="space-y-2 text-center md:text-left">
                    <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono rounded font-bold uppercase tracking-widest">
                      Результат тестування згенеровано
                    </span>
                    <h2 className="text-2xl font-bold font-display text-slate-100">
                      Студент: {latestAttempt.studentName}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Час завершення: {latestAttempt.timestamp} | Тривалість: {formatTime(latestAttempt.durationSeconds)}
                    </p>
                  </div>

                  {/* Score Indicator */}
                  <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold font-mono tracking-tight text-cyan-400">
                        {latestAttempt.score} <span className="text-slate-600 text-lg">/ 10</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase mt-1">Оцінка стенду</div>
                    </div>
                    <div className="border-l border-slate-800 h-10"></div>
                    <div className="max-w-[150px]">
                      <span className="text-xs font-bold block text-slate-300">
                        {latestAttempt.score >= 9 ? 'Відмінно! 🎉' : latestAttempt.score >= 7 ? 'Добре! 👍' : latestAttempt.score >= 5 ? 'Зараховано! 🆗' : 'Потрібно підготуватися ⚠️'}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                        {latestAttempt.score >= 8 
                          ? 'Ви чудово засвоїли принцип дії та конфігурацію електромагнітних реле.' 
                          : 'Рекомендуємо детальніше переглянути розбір помилок у схемах нижче.'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Subtopic performance breakdown */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
                  <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider mb-4">
                    ДІАГНОСТИКА ЗНАНЬ ЗА КАТЕГОРІЯМИ
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Object.entries(latestAttempt.categoryScores || {}).map(([category, stat]: [string, any]) => {
                      const pct = Math.round((stat.correct / stat.total) * 100);
                      return (
                        <div key={category} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-300">{category}</span>
                            <span className="font-mono font-bold text-cyan-400">{stat.correct} з {stat.total} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Question-by-Question Review Panel */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
                    ПОВНИЙ СТУДЕНТСЬКИЙ ЗВІТ ТА РОЗБІР ЗАПИТАНЬ
                  </h3>

                  {QUESTIONS.map((q, idx) => {
                    const studentAns = latestAttempt.answers[q.id];
                    const correct = isAnswerCorrect(q, studentAns);

                    return (
                      <div 
                        key={q.id} 
                        className={`border rounded-2xl overflow-hidden shadow-md transition-all ${
                          correct 
                            ? 'bg-slate-900/30 border-emerald-500/20 shadow-emerald-950/5' 
                            : 'bg-slate-900/40 border-red-500/20 shadow-red-950/5'
                        }`}
                      >
                        {/* Header of review question */}
                        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400 font-bold">ЗАПИТАННЯ {idx + 1}</span>
                            <span className="text-xs font-mono text-slate-500">|</span>
                            <span className="text-[10px] font-mono text-cyan-400 uppercase bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-900/30">
                              {q.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {correct ? (
                              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                ПРАВИЛЬНО
                              </span>
                            ) : (
                              <span className="text-xs text-red-400 font-mono font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                ПОМИЛКА
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question content review layout */}
                        <div className="p-6 grid md:grid-cols-12 gap-6 items-start">
                          
                          {/* Text review block */}
                          <div className="md:col-span-7 space-y-4">
                            <h4 className="text-base font-semibold text-slate-200">
                              {q.questionText}
                            </h4>

                            {/* Render user's answer review details */}
                            <div className="space-y-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                              <span className="text-[10px] font-mono text-slate-400 block uppercase">Ваша відповідь:</span>
                              
                              {/* Single */}
                              {q.type === QuestionType.SINGLE && (
                                <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                                  {correct ? <Check className="text-emerald-400 w-4 h-4" /> : <X className="text-red-400 w-4 h-4" />}
                                  <span>{q.options[studentAns] || '— (не вибрано)'}</span>
                                </div>
                              )}

                              {/* Multiple */}
                              {q.type === QuestionType.MULTIPLE && (
                                <div className="space-y-1">
                                  {(studentAns || []).length === 0 ? (
                                    <span className="text-xs text-slate-500 font-mono">— нічого не обрано</span>
                                  ) : (
                                    (studentAns || []).map((ansIdx: number) => (
                                      <div key={ansIdx} className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                                        {q.correctAnswerIndices.includes(ansIdx) ? (
                                          <Check className="text-emerald-400 w-3.5 h-3.5" />
                                        ) : (
                                          <X className="text-red-400 w-3.5 h-3.5" />
                                        )}
                                        <span>{q.options[ansIdx]}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}

                              {/* Table */}
                              {q.type === QuestionType.TABLE && (
                                <div className="text-xs space-y-1">
                                  {q.rows.map((rowText, rIdx) => {
                                    const colSelectedIdx = studentAns?.[rIdx];
                                    const isRowCorrect = colSelectedIdx !== undefined && Number(colSelectedIdx) === q.correctMatches[rIdx];
                                    return (
                                      <div key={rIdx} className="flex justify-between items-center text-slate-300 border-b border-slate-900 pb-1">
                                        <span className="font-mono text-[10px]">{rowText}:</span>
                                        <span className={`font-semibold flex items-center gap-1 text-[11px] ${isRowCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                          {isRowCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                          {colSelectedIdx !== undefined ? q.columns[colSelectedIdx] : '— не обрано'}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Detailed explanation always visible to student */}
                            <div className="bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10 space-y-1">
                              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">ПОЯСНЕННЯ СТЕНДУ:</span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {q.explanation}
                              </p>
                            </div>

                          </div>

                          {/* Visual component review block */}
                          <div className="md:col-span-5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] font-mono text-slate-500 block mb-2 text-center uppercase">Схематична ілюстрація</span>
                            <QuestionVisual questionId={q.id} />
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reset test controls */}
                <div className="text-center py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStage('welcome');
                      setStudentName('');
                    }}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-display rounded-xl flex items-center gap-2 mx-auto transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    ПРОЙТИ ТЕСТ ЩЕ РАЗ (НОВИЙ СТУДЕНТ)
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        )}

        {/* ROLE: LECTURER (ANALYTICS & RESULTS LOG) */}
        {role === 'lecturer' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            
            {/* GOOGLE FORMS INTEGRATION BLOCK */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-md backdrop-blur-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
                <div>
                  <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-emerald-400">📝</span>
                    ІНТЕГРАЦІЯ З GOOGLE FORMS API
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Створіть інтерактивний онлайн-тест у вашому Google Диску в один клік
                  </p>
                </div>
                {googleUser ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      {googleUser.photoURL ? (
                        <img src={googleUser.photoURL} alt={googleUser.displayName} className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-slate-950 font-bold">G</div>
                      )}
                      <span className="text-xs font-mono text-slate-300 font-bold">{googleUser.displayName || googleUser.email}</span>
                    </div>
                    <button
                      onClick={handleGoogleLogout}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg border border-transparent hover:border-red-900/30 transition-all cursor-pointer"
                      title="Вийти"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateGoogleForm}
                    className="gsi-material-button text-xs"
                    style={{ margin: 0 }}
                  >
                    <div className="gsi-material-button-state"></div>
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents font-mono">Авторизувати Google Диск</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Form Creation Action Area */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/80 border border-slate-800 gap-4">
                {createdForm ? (
                  <div className="w-full space-y-4">
                    <div className="bg-emerald-950/30 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-lg shrink-0">
                        🎉
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                          Тест «test1rele» успішно створено!
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          Форма згенерована та збережена у вашому Google Диску. Ви можете налаштувати або поширити її за посиланнями нижче.
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <a
                        href={createdForm.editUri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 text-xs font-mono font-bold transition-all text-cyan-400 group cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          ✏️ Редагувати форму (test1rele)
                        </span>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </a>

                      <a
                        href={createdForm.responderUri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 text-xs font-mono font-bold transition-all text-emerald-400 group cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          👁️ Відкрити як студент (пройти тест)
                        </span>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-4 max-w-lg">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      При натисканні кнопки нижче всі 10 запитань нашого стенду автоматично імпортуються до Google Forms з правильними відповідями, розділенням балів та вичерпними поясненнями.
                    </p>

                    <button
                      onClick={handleCreateGoogleForm}
                      disabled={isCreatingForm}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center gap-2 mx-auto transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isCreatingForm ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ГЕНЕРУЄМО GOOGLE ФОРМУ...
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          СТВОРИТИ GOOGLE ФОРМУ (test1rele)
                        </>
                      )}
                    </button>
                  </div>
                )}

                {formError && (
                  <div className="w-full bg-red-950/20 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg font-mono text-left">
                    ⚠️ Помилка створення: {formError}
                  </div>
                )}
              </div>
            </div>

            {/* Lecturer Dashboard Overview Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Усього Складено Тестів</span>
                  <span className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-amber-400 mt-1 block">
                    {totalAttemptsCount}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">активних логів студентів</span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
                  👥
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Середня успішність</span>
                  <span className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-cyan-400 mt-1 block">
                    {avgScore} <span className="text-slate-600 text-lg">/ 10</span>
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                    {totalAttemptsCount > 0 ? `${Math.round((Number(avgScore) / 10) * 100)}% правильних відповідей` : 'немає логів'}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl">
                  📈
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Середній час</span>
                  <span className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-emerald-400 mt-1 block">
                    {totalAttemptsCount > 0 ? `${Math.floor(avgTime / 60)} хв ${avgTime % 60} с` : '0 с'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">тривалість аналізу схем</span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                  ⏱️
                </div>
              </div>

            </div>

            {/* Visual Classroom Performance breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Category-wise averages */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-md backdrop-blur-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="text-amber-400">📊</span>
                    УСПІШНІСТЬ ЗА ТЕМАМИ КУРСУ
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">класна статистика</span>
                </div>

                <div className="space-y-4">
                  {Object.entries(topicStats).map(([topic, stat]) => {
                    const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                    return (
                      <div key={topic} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-medium">{topic}</span>
                          <span className="font-mono font-bold text-amber-400">{pct}% правильних</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {totalAttemptsCount === 0 && (
                    <p className="text-center text-xs text-slate-500 font-mono py-4">Немає збережених відповідей для побудови аналітики</p>
                  )}
                </div>
              </div>

              {/* Success Rate per individual question */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-md backdrop-blur-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="text-cyan-400">⚡</span>
                    ВІДСОТОК ПРАВИЛЬНИХ ВІДПОВІДЕЙ НА КОЖНЕ ЗАПИТАННЯ
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">10 тестових завдань</span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 text-center">
                  {questionSuccessRates.map((rate, qIdx) => (
                    <div key={qIdx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex flex-col justify-between items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500">№{qIdx + 1}</span>
                      <div className="w-full bg-slate-900 h-12 rounded relative flex items-end overflow-hidden border border-slate-850">
                        <div 
                          className="bg-cyan-500 w-full transition-all" 
                          style={{ height: `${rate}%` }}
                        ></div>
                        <span className="absolute inset-x-0 bottom-1 text-[9px] font-mono font-bold text-slate-100 drop-shadow">
                          {rate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {totalAttemptsCount > 0 ? (
                  <div className="text-[10px] text-slate-400 leading-relaxed font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                    💡 <span className="text-slate-300 font-bold">Порада викладачу:</span> згідно з графіком, студенти найкраще засвоїли запитання, де успішність вище 80%. Зверніть особливу увагу на теми з низьким відсотком проходження.
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-500 font-mono py-4">Логи пусті</p>
                )}
              </div>

            </div>

            {/* Search & Actions toolbar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-md backdrop-blur-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Пошук студента за імʼям..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 text-slate-200"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto shrink-0 pb-1 sm:pb-0">
                <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
                  <span className="text-[10px] font-mono text-slate-500">СОРТУВАТИ:</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-mono text-amber-400 font-bold outline-none cursor-pointer"
                  >
                    <option value="date" className="bg-slate-950">Датою завершення</option>
                    <option value="score" className="bg-slate-950">Оцінкою</option>
                    <option value="name" className="bg-slate-950 font-sans">Алфавітом студента</option>
                  </select>
                </div>

                <button
                  onClick={handleAddRandomAttempt}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  + ЗГЕНЕРУВАТИ СПРОБУ
                </button>

                <button
                  onClick={() => handleResetLecturerLogs(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  СКИД ДО СІДІВ
                </button>

                <button
                  onClick={() => handleResetLecturerLogs(false)}
                  className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 text-xs font-mono font-bold rounded-lg border border-red-900/30 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ОЧИСТИТИ ВСЕ
                </button>
              </div>

            </div>

            {/* List of attempts */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              
              <div className="px-5 py-4 bg-slate-950/40 border-b border-slate-800/80 flex justify-between items-center">
                <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  📁 ЖУРНАЛ СТУДЕНТСЬКИХ СПРОБ ТА ОЦІНОК
                </h3>
                <span className="text-[10px] font-mono text-slate-500">Показано: {sortedAttempts.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400 text-xs font-mono uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Студент</th>
                      <th className="p-4">Дата/Час складання</th>
                      <th className="p-4 text-center">Оцінка (з 10)</th>
                      <th className="p-4 text-center">Час виконання</th>
                      <th className="p-4 text-right">Дії</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-slate-300">
                    {sortedAttempts.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                              {attempt.studentName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold block text-slate-200">{attempt.studentName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {attempt.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-mono text-slate-400">
                          {attempt.timestamp}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded-full border ${
                            attempt.score >= 9 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : attempt.score >= 7 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {attempt.score} / 10
                          </span>
                        </td>
                        <td className="p-4 text-center text-xs font-mono text-slate-400">
                          {formatTime(attempt.durationSeconds)}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedAttempt(attempt)}
                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 ml-auto transition-all cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                            Детально
                          </button>
                        </td>
                      </tr>
                    ))}
                    {sortedAttempts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-sm text-slate-500 font-mono">
                          Журнал порожній. Жоден студент ще не проходив тестування.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* SELECTED ATTEMPT MODAL DRAWER */}
            {selectedAttempt && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
                >
                  
                  {/* Modal Header */}
                  <div className="px-6 py-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 block uppercase font-bold">СТУДЕНТСЬКИЙ ЕКЗАМЕНАЦІЙНИЙ ЛИСТ</span>
                      <h3 className="text-base font-bold text-slate-100 mt-0.5">{selectedAttempt.studentName}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedAttempt(null)}
                      className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg cursor-pointer"
                    >
                      Закрити
                    </button>
                  </div>

                  {/* Modal Content - Scrollable */}
                  <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/40">
                    
                    {/* Summary row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Бал студента:</span>
                        <span className="text-lg font-bold font-mono text-amber-400 block">{selectedAttempt.score} / 10</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Успішність:</span>
                        <span className="text-lg font-bold font-mono text-cyan-400 block">{Math.round((selectedAttempt.score/10)*100)}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Час тестування:</span>
                        <span className="text-lg font-bold font-mono text-emerald-400 block">{formatTime(selectedAttempt.durationSeconds)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Дата подачі:</span>
                        <span className="text-xs font-bold font-mono text-slate-400 block mt-1.5">{selectedAttempt.timestamp.split(',')[0]}</span>
                      </div>
                    </div>

                    {/* Question summary detailed logs */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                        Аналіз відповідей на кожне з 10 запитань
                      </h4>

                      {QUESTIONS.map((q, qIdx) => {
                        const ans = selectedAttempt.answers[q.id];
                        const isCorrect = isAnswerCorrect(q, ans);

                        return (
                          <div 
                            key={q.id} 
                            className={`p-4 rounded-xl border text-xs space-y-3 ${
                              isCorrect 
                                ? 'bg-slate-950/20 border-emerald-500/10' 
                                : 'bg-slate-950/40 border-red-500/10'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-[10px] text-slate-400 font-bold">ЗАПИТАННЯ №{qIdx + 1} ({q.category})</span>
                              <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                                isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {isCorrect ? '✓ ПРАВИЛЬНО' : '✗ ПОМИЛКА'}
                              </span>
                            </div>

                            <p className="font-medium text-slate-200 leading-normal">{q.questionText}</p>

                            <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80">
                              <span className="text-[9px] font-mono text-slate-500 block uppercase mb-1">Обрана студентом відповідь:</span>
                              
                              {q.type === QuestionType.SINGLE && (
                                <span className="font-semibold text-slate-300">{q.options[ans] || '— (не вибрано)'}</span>
                              )}

                              {q.type === QuestionType.MULTIPLE && (
                                <div className="space-y-1">
                                  {(ans || []).length === 0 ? (
                                    <span className="text-slate-500">— нічого не вибрано</span>
                                  ) : (
                                    (ans || []).map((idx: number) => (
                                      <div key={idx} className="flex items-center gap-1.5 font-semibold text-slate-300">
                                        <span>• {q.options[idx]}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}

                              {q.type === QuestionType.TABLE && (
                                <div className="space-y-1 text-[11px]">
                                  {q.rows.map((rowTitle, rIdx) => {
                                    const colSelected = ans?.[rIdx];
                                    return (
                                      <div key={rIdx} className="flex justify-between">
                                        <span className="text-slate-400 font-mono">{rowTitle}:</span>
                                        <span className="font-semibold text-slate-300">{colSelected !== undefined ? q.columns[colSelected] : '— не обрано'}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>

                </motion.div>
              </div>
            )}

          </motion.div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-[11px] font-mono text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Стенд розроблено відповідно до Державного стандарту технічної освіти.</span>
          <span>© 2026 Лабораторна система • Тема "Реле"</span>
        </div>
      </footer>

    </div>
  );
}
