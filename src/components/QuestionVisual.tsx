import React, { useState } from 'react';
import { motion } from 'motion/react';

interface QuestionVisualProps {
  questionId: number;
  userAnswer?: any; // To allow reacting to current selection
}

export const QuestionVisual: React.FC<QuestionVisualProps> = ({ questionId }) => {
  const [isPowerOn, setIsPowerOn] = useState(false);

  // Render different SVGs based on question ID
  switch (questionId) {
    case 1: {
      // Principle of operation: Coil, Core, Armature, Contacts, Spring
      return (
        <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-cyan-500/20 shadow-inner w-full max-w-md mx-auto">
          <div className="flex justify-between items-center w-full mb-3">
            <span className="text-xs font-mono text-cyan-400">СХЕМА №1: ПРИНЦИП ДІЇ РЕЛЕ</span>
            <button
              onClick={() => setIsPowerOn(!isPowerOn)}
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                isPowerOn
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Котушка: {isPowerOn ? 'АКТИВНА (СТРУМ Є)' : 'ЗНЕСТРУМЛЕНА (СТРУМУ НЕМАЄ)'}
            </button>
          </div>

          <svg viewBox="0 0 400 220" className="w-full h-auto bg-slate-950/80 rounded-lg border border-slate-800">
            {/* Magnetic Field Glow */}
            {isPowerOn && (
              <g>
                <circle cx="120" cy="110" r="50" fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="15" strokeDasharray="5,5" className="animate-spin" style={{ animationDuration: '6s' }} />
                <circle cx="120" cy="110" r="70" fill="none" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="10" strokeDasharray="10,5" className="animate-spin" style={{ animationDuration: '10s' }} />
                {/* Magnetic Flux Lines */}
                <path d="M 70,110 C 70,40, 170,40, 170,110 C 170,180, 70,180, 70,110" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" strokeDasharray="5,5" />
                <path d="M 85,110 C 85,60, 155,60, 155,110 C 155,160, 85,160, 85,110" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" strokeDasharray="5,5" />
              </g>
            )}

            {/* Electromagnetic Coil & Iron Core */}
            <rect x="100" y="70" width="40" height="80" rx="4" fill="#334155" stroke="#475569" strokeWidth="2" />
            {/* Winding Copper Lines */}
            <g stroke="#f59e0b" strokeWidth="2.5" opacity={isPowerOn ? 1 : 0.7}>
              <line x1="100" y1="80" x2="140" y2="85" />
              <line x1="100" y1="90" x2="140" y2="95" />
              <line x1="100" y1="100" x2="140" y2="105" />
              <line x1="100" y1="110" x2="140" y2="115" />
              <line x1="100" y1="120" x2="140" y2="125" />
              <line x1="100" y1="130" x2="140" y2="135" />
              <line x1="100" y1="140" x2="140" y2="145" />
              {/* Coil Connections */}
              <path d="M 120,60 L 120,70" stroke="#94a3b8" strokeWidth="2" />
              <path d="M 120,150 L 120,165" stroke="#94a3b8" strokeWidth="2" />
            </g>
            <text x="120" y="115" fill="#f8fafc" fontSize="10" textAnchor="middle" fontWeight="bold" className="font-mono">
              КОТУШКА
            </text>

            {/* Armature (Рухомий якір) */}
            <motion.g
              animate={{ rotate: isPowerOn ? -7 : 0 }}
              style={{ transformOrigin: '180px 150px' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Metal L-shape armature */}
              <path d="M 180,150 L 180,70 L 260,70" fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
              <rect x="168" y="75" width="8" height="60" fill="#cbd5e1" rx="1" />
              <text x="195" y="62" fill="#cbd5e1" fontSize="9" fontWeight="bold" className="font-mono">
                ЯКІР (РУХОМИЙ)
              </text>
              {/* Contact tip */}
              <circle cx="260" cy="70" r="6" fill="#38bdf8" />
            </motion.g>

            {/* Pivot hinge point */}
            <circle cx="180" cy="150" r="5" fill="#64748b" />

            {/* Return Spring (Поворотна пружина) */}
            <path
              d={isPowerOn 
                ? "M 180,110 Q 195,115 190,120 T 205,125 T 200,130 T 215,135" 
                : "M 180,110 Q 190,112 185,115 T 195,118 T 190,121 T 200,125"
              }
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
            />
            <text x="210" y="125" fill="#94a3b8" fontSize="8" className="font-mono">ПРУЖИНА</text>

            {/* Stationary Contacts (Нерухомі контакти) */}
            {/* NC Contact (Top) */}
            <path d="M 310,50 L 270,50 L 270,58" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            <circle cx="270" cy="58" r="5" fill="#fca5a5" />
            <text x="315" y="53" fill="#f87171" fontSize="9" className="font-mono font-bold">NC (Замкнений)</text>

            {/* NO Contact (Bottom) */}
            <path d="M 310,95 L 270,95 L 270,82" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
            <circle cx="270" cy="82" r="5" fill="#86efac" />
            <text x="315" y="99" fill="#4ade80" fontSize="9" className="font-mono font-bold">NO (Розімкнений)</text>

            {/* Wire connection indicators */}
            <circle cx="120" cy="60" r="3" fill="#f59e0b" />
            <circle cx="120" cy="165" r="3" fill="#f59e0b" />
            <circle cx="180" cy="150" r="3" fill="#e2e8f0" />

            {/* Simple explanatory helper */}
            <rect x="10" y="180" width="380" height="30" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="#1e293b" />
            <text x="20" y="198" fill="#94a3b8" fontSize="9" className="font-sans">
              {isPowerOn 
                ? "💡 Котушка притягнула якір. Контакт з'єднався з зеленим NO виводом."
                : "💤 Струму немає. Пружина тримає контакт з'єднаним з червоним NC виводом."
              }
            </text>
          </svg>
        </div>
      );
    }

    case 2: {
      // NO vs NC: Two distinct side-by-side switches reacting to state
      return (
        <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-cyan-500/20 shadow-inner w-full max-w-md mx-auto">
          <div className="flex justify-between items-center w-full mb-3">
            <span className="text-xs font-mono text-cyan-400">НОРМАЛЬНИЙ СТАН КОНТАКТІВ (БЕЗ СТРУМУ)</span>
            <button
              onClick={() => setIsPowerOn(!isPowerOn)}
              className="text-xs text-cyan-400 underline hover:text-cyan-300 cursor-pointer"
            >
              {isPowerOn ? 'Скинути у спокій' : 'Подати тестовий струм'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            {/* NO Switch Block */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex flex-col items-center">
              <span className="text-xs font-bold text-emerald-400 mb-1 font-mono">NO (Normally Open)</span>
              <span className="text-[10px] text-slate-400 text-center mb-2">Нормально Розімкнений</span>

              <svg viewBox="0 0 100 80" className="w-24 h-auto">
                <line x1="10" y1="40" x2="35" y2="40" stroke="#64748b" strokeWidth="3" />
                <line x1="65" y1="40" x2="90" y2="40" stroke="#22c55e" strokeWidth="3" />
                <circle cx="35" cy="40" r="4" fill="#64748b" />
                <circle cx="65" cy="40" r="4" fill="#22c55e" />
                {/* Switch lever */}
                <motion.line
                  x1="35"
                  y1="40"
                  x2="65"
                  y2={isPowerOn ? 40 : 20}
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  animate={{ y2: isPowerOn ? 40 : 20 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                />
              </svg>
              <div className={`text-xs mt-2 font-mono font-bold px-2 py-0.5 rounded ${
                isPowerOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {isPowerOn ? 'ЗАМКНЕНО (СТРУМ ЙДЕ)' : 'ВІДКРИТО (СТРУМУ НЕМА)'}
              </div>
            </div>

            {/* NC Switch Block */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex flex-col items-center">
              <span className="text-xs font-bold text-red-400 mb-1 font-mono">NC (Normally Closed)</span>
              <span className="text-[10px] text-slate-400 text-center mb-2">Нормально Замкнений</span>

              <svg viewBox="0 0 100 80" className="w-24 h-auto">
                <line x1="10" y1="40" x2="35" y2="40" stroke="#ef4444" strokeWidth="3" />
                <line x1="65" y1="40" x2="90" y2="40" stroke="#64748b" strokeWidth="3" />
                <circle cx="35" cy="40" r="4" fill="#ef4444" />
                <circle cx="65" cy="40" r="4" fill="#64748b" />
                {/* Switch lever */}
                <motion.line
                  x1="35"
                  y1="40"
                  x2="65"
                  y2={isPowerOn ? 60 : 40}
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                  animate={{ y2: isPowerOn ? 60 : 40 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                />
              </svg>
              <div className={`text-xs mt-2 font-mono font-bold px-2 py-0.5 rounded ${
                isPowerOn ? 'bg-slate-800 text-slate-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isPowerOn ? 'ВІДКРИТО (СТРУМУ НЕМА)' : 'ЗАМКНЕНО (СТРУМ ЙДЕ)'}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 3: {
      // Galvanic Isolation Diagram
      return (
        <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-cyan-500/20 shadow-inner w-full max-w-md mx-auto">
          <span className="text-xs font-mono text-cyan-400 self-start mb-2">ГАЛЬВАНІЧНА РОЗВʼЯЗКА (БЕЗПЕКА)</span>
          <svg viewBox="0 0 380 150" className="w-full h-auto bg-slate-950/80 rounded-lg border border-slate-800 p-2">
            {/* Safe Control Side */}
            <rect x="10" y="20" width="120" height="110" rx="8" fill="rgba(6, 182, 212, 0.05)" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="70" y="40" fill="#06b6d4" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">КЕРУВАННЯ (5В)</text>
            <circle cx="70" cy="75" r="15" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <path d="M 62,75 L 78,75 M 70,67 L 70,83" stroke="#06b6d4" strokeWidth="2" />
            <text x="70" y="110" fill="#94a3b8" fontSize="8" textAnchor="middle">Слабкий сигнал (Кнопка, Чіп)</text>

            {/* Isolation Barrier Grid */}
            <line x1="165" y1="10" x2="165" y2="140" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,4" />
            <text x="165" y="75" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90 165 75)" dy="-5" className="font-mono">ІЗОЛЯЦІЯ (ФІЗИЧНИЙ БАРʼЄР)</text>

            {/* High Power Side */}
            <rect x="200" y="20" width="170" height="110" rx="8" fill="rgba(239, 68, 68, 0.05)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="285" y="40" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">СИЛОВА ЧАСТИНА (220В)</text>

            {/* Heating Element or Motor Schema */}
            <circle cx="285" cy="75" r="14" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
            <path d="M 277,71 L 293,79 M 277,79 L 293,71" stroke="#ef4444" strokeWidth="2" />
            <text x="285" y="110" fill="#94a3b8" fontSize="8" textAnchor="middle">Потужний мотор або обігрівач</text>

            {/* Magnetic Coupling Arrow */}
            <path d="M 115,75 Q 165,65 215,75" fill="none" stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#arrow)" strokeDasharray="3,3" />
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0,0 L 10,5 L 0,10 z" fill="#f59e0b" />
              </marker>
            </defs>
            <text x="165" y="130" fill="#cbd5e1" fontSize="9" textAnchor="middle" className="font-mono font-bold">Лише магнітне поле!</text>
          </svg>
        </div>
      );
    }

    case 4: {
      // SPDT Switch
      return (
        <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-cyan-500/20 shadow-inner w-full max-w-md mx-auto">
          <div className="flex justify-between items-center w-full mb-2">
            <span className="text-xs font-mono text-cyan-400">ПЕРЕКИДНИЙ КОНТАКТ (SPDT / CO)</span>
            <button
              onClick={() => setIsPowerOn(!isPowerOn)}
              className="text-xs px-2 py-0.5 bg-slate-800 text-cyan-400 rounded hover:bg-slate-700 cursor-pointer"
            >
              Перемкнути
            </button>
          </div>

          <svg viewBox="0 0 300 130" className="w-full h-auto bg-slate-950/80 rounded-lg border border-slate-800 p-2">
            {/* Input COM pin */}
            <circle cx="50" cy="65" r="6" fill="#06b6d4" />
            <line x1="10" y1="65" x2="50" y2="65" stroke="#06b6d4" strokeWidth="3" />
            <text x="50" y="85" fill="#06b6d4" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">COM (Спільний)</text>

            {/* Arm line */}
            <motion.line
              x1="50"
              y1="65"
              x2="200"
              y2={isPowerOn ? 95 : 35}
              stroke="#cbd5e1"
              strokeWidth="4"
              strokeLinecap="round"
              animate={{ y2: isPowerOn ? 95 : 35 }}
              transition={{ type: 'spring', stiffness: 150 }}
            />

            {/* Output 1 NC pin */}
            <circle cx="200" cy="35" r="6" fill={!isPowerOn ? '#ef4444' : '#64748b'} />
            <line x1="200" y1="35" x2="280" y2="35" stroke={!isPowerOn ? '#ef4444' : '#475569'} strokeWidth="3" />
            <text x="240" y="25" fill={!isPowerOn ? '#ef4444' : '#64748b'} fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">NC (Норм. замкнений)</text>

            {/* Output 2 NO pin */}
            <circle cx="200" cy="95" r="6" fill={isPowerOn ? '#22c55e' : '#64748b'} />
            <line x1="200" y1="95" x2="280" y2="95" stroke={isPowerOn ? '#22c55e' : '#475569'} strokeWidth="3" />
            <text x="240" y="115" fill={isPowerOn ? '#22c55e' : '#64748b'} fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">NO (Норм. розімкнений)</text>

            {/* Glowing active path */}
            {isPowerOn ? (
              <path d="M 10,65 L 50,65 L 200,95 L 280,95" fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M 10,65 L 50,65 L 200,35 L 280,35" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </div>
      );
    }

    case 5: {
      // Internal parts checklist diagram
      return (
        <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-cyan-500/20 shadow-inner w-full max-w-md mx-auto">
          <span className="text-xs font-mono text-cyan-400 self-start mb-2">БУДОВА ЕЛЕКТРОМАГНІТНОГО РЕЛЕ</span>
          <svg viewBox="0 0 360 160" className="w-full h-auto bg-slate-950/80 rounded-lg border border-slate-800">
            {/* Coil */}
            <rect x="50" y="30" width="60" height="70" rx="4" fill="#3b4252" stroke="#4c566a" strokeWidth="2" />
            <path d="M 50,40 L 110,45 M 50,55 L 110,60 M 50,70 L 110,75 M 50,85 L 110,90" stroke="#f59e0b" strokeWidth="2" />
            {/* Armature */}
            <path d="M 130,120 L 130,40 L 190,40" fill="none" stroke="#eceff4" strokeWidth="6" strokeLinecap="round" />
            {/* Spring */}
            <path d="M 130,80 Q 145,82 140,85 T 150,88 T 145,91 T 155,94" fill="none" stroke="#a3be8c" strokeWidth="2" />
            {/* Contacts */}
            <circle cx="190" cy="40" r="5" fill="#38bdf8" />
            <circle cx="215" cy="30" r="4" fill="#ef4444" />
            <circle cx="215" cy="50" r="4" fill="#22c55e" />

            {/* Labels overlay */}
            <g fontSize="9" className="font-mono font-bold" fill="#cbd5e1">
              <rect x="20" y="115" width="80" height="15" rx="3" fill="#1e293b" stroke="#475569" />
              <text x="60" y="126" textAnchor="middle">1. Котушка</text>
              <line x1="60" y1="115" x2="80" y2="100" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />

              <rect x="110" y="10" width="80" height="15" rx="3" fill="#1e293b" stroke="#475569" />
              <text x="150" y="21" textAnchor="middle">2. Якір (рухомий)</text>
              <line x1="150" y1="25" x2="150" y2="40" stroke="#eceff4" strokeWidth="1" strokeDasharray="2,2" />

              <rect x="230" y="70" width="85" height="15" rx="3" fill="#1e293b" stroke="#475569" />
              <text x="272" y="81" textAnchor="middle">3. Пружина</text>
              <line x1="230" y1="77" x2="155" y2="88" stroke="#a3be8c" strokeWidth="1" strokeDasharray="2,2" />

              <rect x="240" y="25" width="105" height="15" rx="3" fill="#1e293b" stroke="#475569" />
              <text x="292" y="36" textAnchor="middle">4. Робочі контакти</text>
              <line x1="240" y1="32" x2="215" y2="40" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
            </g>
          </svg>
        </div>
      );
    }

    case 6: {
      // Contact types side-by-side symbols
      return (
        <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-cyan-500/20 shadow-inner w-full max-w-md mx-auto">
          <span className="text-xs font-mono text-cyan-400 self-start mb-2">ПОЗНАЧЕННЯ НА ЕЛЕКТРИЧНИХ СХЕМАХ</span>
          <div className="grid grid-cols-3 gap-2 w-full text-center">
            <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-emerald-400 block mb-1 font-bold">NO (Замикаючий)</span>
              <svg viewBox="0 0 60 40" className="w-12 h-10 mx-auto">
                <line x1="5" y1="20" x2="20" y2="20" stroke="#86efac" strokeWidth="2" />
                <line x1="40" y1="20" x2="55" y2="20" stroke="#86efac" strokeWidth="2" />
                <line x1="20" y1="20" x2="40" y2="10" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-red-400 block mb-1 font-bold">NC (Розмикаючий)</span>
              <svg viewBox="0 0 60 40" className="w-12 h-10 mx-auto">
                <line x1="5" y1="20" x2="20" y2="20" stroke="#fca5a5" strokeWidth="2" />
                <line x1="40" y1="20" x2="55" y2="20" stroke="#fca5a5" strokeWidth="2" />
                <line x1="20" y1="20" x2="40" y2="20" stroke="#fca5a5" strokeWidth="2" />
                <line x1="17" y1="13" x2="23" y2="27" stroke="#fca5a5" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-amber-400 block mb-1 font-bold">CO (Перекидний)</span>
              <svg viewBox="0 0 60 40" className="w-12 h-10 mx-auto">
                <line x1="5" y1="20" x2="20" y2="20" stroke="#fcd34d" strokeWidth="2" />
                <line x1="40" y1="10" x2="55" y2="10" stroke="#fcd34d" strokeWidth="2" />
                <line x1="40" y1="30" x2="55" y2="30" stroke="#fcd34d" strokeWidth="2" />
                <line x1="20" y1="20" x2="40" y2="10" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    case 7: {
      // Practical application diagram (automotive / home)
      return (
        <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-cyan-500/20 shadow-inner w-full max-w-md mx-auto">
          <span className="text-xs font-mono text-cyan-400 self-start mb-1">ПРИКЛАД: КЕРУВАННЯ АВТОМОБІЛЬНИМИ ФАРАМИ</span>
          <svg viewBox="0 0 360 140" className="w-full h-auto bg-slate-950/80 rounded-lg border border-slate-800 p-2">
            {/* Dashboard button */}
            <rect x="15" y="45" width="55" height="35" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="42" y="65" fill="#38bdf8" fontSize="8" textAnchor="middle" fontWeight="bold" className="font-mono">КНОПКА</text>
            <text x="42" y="75" fill="#94a3b8" fontSize="7" textAnchor="middle">Струм 0.1А</text>

            {/* Dotted lines from button to relay coil */}
            <path d="M 70,62 L 130,62" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* Relay component */}
            <rect x="130" y="30" width="80" height="65" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
            <text x="170" y="45" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="bold" className="font-mono">РЕЛЕ</text>
            <circle cx="170" cy="65" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2" className="animate-pulse" />

            {/* Strong line from relay to high power lamp */}
            <path d="M 210,62 L 270,62" fill="none" stroke="#ef4444" strokeWidth="3" />

            {/* Automobile Headlamp */}
            <circle cx="300" cy="62" r="18" fill="#0f172a" stroke="#fbbf24" strokeWidth="2.5" />
            {/* Glowing rays */}
            <path d="M 320,62 L 340,62 M 315,45 L 332,35 M 315,79 L 332,89" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            <text x="300" y="66" fill="#fbbf24" fontSize="8" textAnchor="middle" fontWeight="bold" className="font-mono">ФАРИ</text>
            <text x="300" y="94" fill="#ef4444" fontSize="8" textAnchor="middle" className="font-mono font-bold">Струм 20А!</text>
          </svg>
        </div>
      );
    }

    case 8: {
      // DPDT Double pole
      return (
        <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-cyan-500/20 shadow-inner w-full max-w-md mx-auto">
          <div className="flex justify-between items-center w-full mb-2">
            <span className="text-xs font-mono text-cyan-400">DPDT (ДВА ПОЛЮСИ, СПАРЕНЕ КЕРУВАННЯ)</span>
            <button
              onClick={() => setIsPowerOn(!isPowerOn)}
              className="text-xs px-2 py-0.5 bg-slate-800 text-cyan-400 rounded hover:bg-slate-700 cursor-pointer"
            >
              Перемкнути обидва
            </button>
          </div>

          <svg viewBox="0 0 320 140" className="w-full h-auto bg-slate-950/80 rounded-lg border border-slate-800 p-2">
            {/* Dotted linking bar (Шток механічного зв'язку) */}
            <line x1="75" y1="45" x2="75" y2="95" stroke="#a78bfa" strokeWidth="2" strokeDasharray="4,4" />
            <rect x="58" y="60" width="34" height="20" rx="3" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" />
            <text x="75" y="72" fill="#c084fc" fontSize="7" textAnchor="middle" className="font-mono font-bold">СПАРКА</text>

            {/* Pole 1 Switch */}
            <circle cx="30" cy="45" r="4" fill="#c084fc" />
            <motion.line
              x1="30"
              y1="45"
              x2="120"
              y2={isPowerOn ? 55 : 25}
              stroke="#eceff4"
              strokeWidth="3.5"
              strokeLinecap="round"
              animate={{ y2: isPowerOn ? 55 : 25 }}
              transition={{ type: 'spring', stiffness: 150 }}
            />
            <circle cx="120" cy="25" r="4" fill={!isPowerOn ? '#ef4444' : '#475569'} />
            <circle cx="120" cy="55" r="4" fill={isPowerOn ? '#22c55e' : '#475569'} />
            <text x="145" y="28" fill="#94a3b8" fontSize="8" className="font-mono">Ланцюг А (1)</text>
            <text x="145" y="58" fill="#94a3b8" fontSize="8" className="font-mono">Ланцюг А (2)</text>

            {/* Pole 2 Switch */}
            <circle cx="30" cy="95" r="4" fill="#c084fc" />
            <motion.line
              x1="30"
              y1="95"
              x2="120"
              y2={isPowerOn ? 105 : 75}
              stroke="#eceff4"
              strokeWidth="3.5"
              strokeLinecap="round"
              animate={{ y2: isPowerOn ? 105 : 75 }}
              transition={{ type: 'spring', stiffness: 150 }}
            />
            <circle cx="120" cy="75" r="4" fill={!isPowerOn ? '#ef4444' : '#475569'} />
            <circle cx="120" cy="105" r="4" fill={isPowerOn ? '#22c55e' : '#475569'} />
            <text x="145" y="78" fill="#94a3b8" fontSize="8" className="font-mono">Ланцюг Б (1)</text>
            <text x="145" y="108" fill="#94a3b8" fontSize="8" className="font-mono">Ланцюг Б (2)</text>
          </svg>
        </div>
      );
    }

    case 9: {
      // Pin mapping grid / table visual helper
      return (
        <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-cyan-500/20 shadow-inner w-full max-w-md mx-auto">
          <span className="text-xs font-mono text-cyan-400 self-start mb-2">РОЗТАШУВАННЯ НІЖОК (ПІНІВ) ТИПОВОГО РЕЛЕ</span>
          <svg viewBox="0 0 320 150" className="w-full h-auto bg-slate-950/80 rounded-lg border border-slate-800 p-2">
            {/* The relay housing outline */}
            <rect x="60" y="15" width="200" height="120" rx="10" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />

            {/* Pins */}
            {/* Coil Pin 1 */}
            <circle cx="100" cy="40" r="8" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
            <text x="100" y="60" fill="#f59e0b" fontSize="8" textAnchor="middle" className="font-mono font-bold">Котушка А</text>

            {/* Coil Pin 2 */}
            <circle cx="220" cy="40" r="8" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
            <text x="220" y="60" fill="#f59e0b" fontSize="8" textAnchor="middle" className="font-mono font-bold">Котушка Б</text>

            {/* COM Pin */}
            <circle cx="160" cy="110" r="8" fill="#06b6d4" stroke="#0891b2" strokeWidth="2" />
            <text x="160" y="130" fill="#06b6d4" fontSize="8" textAnchor="middle" className="font-mono font-bold">COM (Спільний)</text>

            {/* NC Pin */}
            <circle cx="100" cy="85" r="8" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
            <text x="100" y="105" fill="#ef4444" fontSize="8" textAnchor="middle" className="font-mono font-bold">NC (Норм. Замк.)</text>

            {/* NO Pin */}
            <circle cx="220" cy="85" r="8" fill="#22c55e" stroke="#16a34a" strokeWidth="2" />
            <text x="220" y="105" fill="#22c55e" fontSize="8" textAnchor="middle" className="font-mono font-bold">NO (Норм. Розімк.)</text>
          </svg>
        </div>
      );
    }

    case 10: {
      // SPST vs SPDT vs DPDT schemas
      return (
        <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-cyan-500/20 shadow-inner w-full max-w-md mx-auto">
          <span className="text-xs font-mono text-cyan-400 self-start mb-2">ПОРІВНЯННЯ СТРУКТУРИ КОНТАКТНИХ ГРУП</span>
          <svg viewBox="0 0 340 140" className="w-full h-auto bg-slate-950/80 rounded-lg border border-slate-800 p-2">
            {/* SPST */}
            <rect x="10" y="10" width="95" height="120" rx="6" fill="#1e293b/40" stroke="#334155" />
            <text x="57" y="25" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">SPST</text>
            <text x="57" y="38" fill="#94a3b8" fontSize="7" textAnchor="middle">1 напрямок</text>
            <circle cx="45" cy="70" r="4" fill="#06b6d4" />
            <line x1="45" y1="70" x2="75" y2="55" stroke="#eceff4" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="75" cy="70" r="4" fill="#475569" />

            {/* SPDT */}
            <rect x="120" y="10" width="95" height="120" rx="6" fill="#1e293b/40" stroke="#334155" />
            <text x="167" y="25" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">SPDT</text>
            <text x="167" y="38" fill="#94a3b8" fontSize="7" textAnchor="middle">1 перекидний</text>
            <circle cx="150" cy="75" r="4" fill="#06b6d4" />
            <line x1="150" y1="75" x2="185" y2="60" stroke="#eceff4" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="185" cy="60" r="4" fill="#ef4444" />
            <circle cx="185" cy="90" r="4" fill="#22c55e" />

            {/* DPDT */}
            <rect x="230" y="10" width="100" height="120" rx="6" fill="#1e293b/40" stroke="#334155" />
            <text x="280" y="25" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">DPDT</text>
            <text x="280" y="38" fill="#94a3b8" fontSize="7" textAnchor="middle">2 перекидні</text>
            {/* Pole A */}
            <circle cx="255" cy="60" r="3" fill="#06b6d4" />
            <line x1="255" y1="60" x2="285" y2="50" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="285" cy="50" r="3" fill="#ef4444" />
            <circle cx="285" cy="70" r="3" fill="#22c55e" />
            {/* Pole B */}
            <circle cx="255" cy="100" r="3" fill="#06b6d4" />
            <line x1="255" y1="100" x2="285" y2="90" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="285" cy="90" r="3" fill="#ef4444" />
            <circle cx="285" cy="110" r="3" fill="#22c55e" />
            {/* Link dotted */}
            <line x1="270" y1="58" x2="270" y2="98" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="2,2" />
          </svg>
        </div>
      );
    }

    default:
      return null;
  }
};
