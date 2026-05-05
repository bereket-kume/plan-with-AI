import { Sidebar } from '../components/SiderBar';
import { SubjectCard } from '../components/SubjectCard';
import { TaskTable } from '../components/TaskTable';
import { Sigma, Database, Wind, MousePointer2, Plus, Filter, ArrowUpDown } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Subject Manager</h1>
            <p className="text-slate-400 mt-2">Track your progress across your current syllabus.</p>
          </div>
          <button className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1">
            View curriculum →
          </button>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <SubjectCard icon={<Sigma size={24} />} title="Advanced Calculus" units={12} progress={75} color="text-blue-600" />
          <SubjectCard icon={<Database size={24} />} title="Data Structures" units={8} progress={40} color="text-indigo-600" />
          <SubjectCard icon={<Wind size={24} />} title="Quantum Mechanics" units={15} progress={90} color="text-emerald-600" />
          <SubjectCard icon={<MousePointer2 size={24} />} title="World History" units={20} progress={20} color="text-orange-600" />
        </div>

        {/* Upcoming Tasks Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Upcoming Tasks</h2>
          <div className="flex gap-3">
            <button className="bg-white px-4 py-2 rounded-xl border border-gray-100 text-sm font-bold text-slate-600 flex items-center gap-2">
              <Filter size={16} /> Filter
            </button>
            <button className="bg-white px-4 py-2 rounded-xl border border-gray-100 text-sm font-bold text-slate-600 flex items-center gap-2">
              <ArrowUpDown size={16} /> Sort
            </button>
          </div>
        </div>

        <TaskTable />

        {/* Floating Action Button */}
        <button className="fixed bottom-10 right-10 w-16 h-16 bg-indigo-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
          <Plus size={32} />
        </button>
      </main>
    </div>
  );
}