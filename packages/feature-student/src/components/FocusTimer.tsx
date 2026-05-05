import { Play, Pause, CheckCircle } from 'lucide-react';

export const FocusTimer = () => {
  return (
    <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden mb-6">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
            Focus Mode Active
          </span>
          <h2 className="text-3xl font-bold mt-4">Deep Work: Psychology</h2>
          <p className="text-indigo-200 mt-2 max-w-md">
            Mastering Cognitive Behavioral Theory - Chapter 4: Neural Pathways & Habit Loops.
          </p>
        </div>
        <div className="text-right">
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Next Up</p>
          <p className="font-semibold">Quiz: Memory Systems</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-10 relative z-10">
        <h1 className="text-8xl font-bold tracking-tighter">24:18</h1>
        <p className="text-indigo-300 font-bold tracking-[0.3em] mt-2 uppercase text-xs">Time Remaining</p>
      </div>

      <div className="flex justify-center gap-4 relative z-10">
        <button className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors">
          <Pause size={18} fill="currentColor" /> Pause Session
        </button>
        <button className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-all">
          Complete Task
        </button>
      </div>
    </div>
  );
};