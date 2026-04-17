import { Sidebar } from '../components/SiderBar';
import { FocusTimer } from '../components/FocusTimer';
import { StatCard } from '../components/StatCards';

import {
  Clock,
  CheckSquare,
  Flame,
  MessageSquareText,
} from 'lucide-react';

/* ================================
   CBSD: SHARED UI COMPONENTS
================================ */

const SearchBar = () => (
  <div className="w-1/3 bg-white px-4 py-2 rounded-xl border border-gray-100 flex items-center">
    <input
      type="text"
      placeholder="Search notes, tasks..."
      className="bg-transparent outline-none w-full text-sm"
    />
  </div>
);

const SessionButton = () => (
  <button className="bg-indigo-800 text-white px-6 py-2 rounded-full font-bold text-sm">
    Start Session
  </button>
);

const UserProfile = () => (
  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
    <img src="/api/placeholder/40/40" alt="User" />
  </div>
);

/* ================================
   CBSD: FEATURE COMPONENTS
================================ */

const TopBar = () => (
  <div className="flex justify-between items-center mb-8">
    <SearchBar />

    <div className="flex items-center gap-4">
      <SessionButton />
      <UserProfile />
    </div>
  </div>
);

const StatsSection = () => {
  const stats = [
    {
      icon: <Clock className="text-indigo-600" />,
      label: 'Total Hours Today',
      value: '6h 42m',
      subValue: '+12% vs yest.',
      color: 'bg-indigo-600',
    },
    {
      icon: <CheckSquare className="text-orange-600" />,
      label: 'Tasks Completed',
      value: '75%',
      subValue: '8/12 done',
      color: 'bg-orange-600',
    },
    {
      icon: <Flame className="text-red-600" />,
      label: 'Streak Count',
      value: '14 Days',
      subValue: 'Personal Record',
      color: 'bg-red-600',
    },
  ];

  return (
    <div className="flex gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          subValue={stat.subValue}
          color={stat.color}
        />
      ))}
    </div>
  );
};

const FlashcardsSection = () => (
  <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm">
    <div className="flex justify-between mb-4">
      <h4 className="font-bold">Recent Flashcards</h4>

      <button className="text-indigo-600 text-sm font-bold">
        Review All →
      </button>
    </div>

    {/* Flashcard Item Component */}
  </div>
);

const ResourceCard = () => (
  <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden relative group cursor-pointer">
    <img
      src="/api/placeholder/400/300"
      alt="Resource"
      className="opacity-60 group-hover:scale-105 transition-transform"
    />

    <div className="absolute bottom-0 p-6">
      <h4 className="text-white font-bold leading-tight">
        New Resource Available
      </h4>

      <p className="text-slate-300 text-xs mt-2">
        "Mastering Neuroplasticity" - A curated study guide.
      </p>

      <button className="mt-4 bg-white px-4 py-2 rounded-lg text-xs font-bold">
        Read Now
      </button>
    </div>
  </div>
);

const DailyFlow = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
    <h4 className="font-bold mb-6">Daily Flow</h4>

    {/* Timeline Logic Component */}
  </div>
);

const StudyAITutor = () => (
  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-indigo-800 p-2 rounded-lg">
        <MessageSquareText size={20} className="text-white" />
      </div>

      <h4 className="font-bold text-indigo-900">
        StudyAI Tutor
      </h4>
    </div>

    <div className="bg-white p-4 rounded-xl text-sm text-slate-600 leading-relaxed">
      "I've noticed you struggled with 'Long-term Potentiation'
      in your last quiz. Would you like a simplified breakdown?"
    </div>

    <button className="w-full mt-4 bg-indigo-900 text-white py-3 rounded-xl font-bold">
      Yes, help me out
    </button>
  </div>
);

/* ================================
   MAIN DASHBOARD PAGE
================================ */

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />

      <main className="flex-1 p-8">
        <TopBar />

        <div className="flex gap-8">
          {/* LEFT SECTION */}
          <div className="flex-[2.5]">
            <FocusTimer />

            <StatsSection />

            <div className="flex gap-6">
              <FlashcardsSection />
              <ResourceCard />
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex-1">
            <DailyFlow />
            <StudyAITutor />
          </div>
        </div>
      </main>
    </div>
  );
}