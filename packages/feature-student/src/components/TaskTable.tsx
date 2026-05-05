import { MoreHorizontal, Clock, Star } from 'lucide-react';

const tasks = [
  { id: 1, name: "Derivatives Practice Set #4", desc: "Complete all odd-numbered problems", subject: "Mathematics", deadline: "In 2 days", difficulty: 2, status: "pending", color: "text-blue-600 bg-blue-50" },
  { id: 2, name: "Binary Search Tree Implementation", desc: "Implement insert, delete, and find methods", subject: "Computer Science", deadline: "Today", difficulty: 5, status: "pending", color: "text-indigo-600 bg-indigo-50" },
  { id: 3, name: "Schrödinger Equation Review", desc: "Review week 3 lecture notes", subject: "Physics", deadline: "Completed", difficulty: 2, status: "completed", color: "text-emerald-600 bg-emerald-50" },
];

export const TaskTable = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-50/50 border-b border-gray-100">
        <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          <th className="p-4 pl-6">Status</th>
          <th className="p-4">Task Name</th>
          <th className="p-4">Subject</th>
          <th className="p-4">Deadline</th>
          <th className="p-4">Difficulty</th>
          <th className="p-4 text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {tasks.map((task) => (
          <tr key={task.id} className={`group hover:bg-slate-50/50 transition-colors ${task.status === 'completed' ? 'opacity-60' : ''}`}>
            <td className="p-4 pl-6">
              <input type="checkbox" checked={task.status === 'completed'} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
            </td>
            <td className="p-4">
              <p className={`font-bold text-sm ${task.status === 'completed' ? 'line-through' : ''}`}>{task.name}</p>
              <p className="text-xs text-slate-400 mt-1">{task.desc}</p>
            </td>
            <td className="p-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${task.color}`}>{task.subject}</span>
            </td>
            <td className="p-4">
               <p className={`text-xs font-bold flex items-center gap-1 ${task.deadline === 'Today' ? 'text-red-500' : task.deadline === 'Completed' ? 'text-emerald-500' : 'text-orange-500'}`}>
                 {task.deadline === 'Completed' ? <Clock size={14} /> : <Clock size={14} />} {task.deadline}
               </p>
            </td>
            <td className="p-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={i < task.difficulty ? 'text-indigo-600 fill-indigo-600' : 'text-slate-200'} />
                ))}
              </div>
            </td>
            <td className="p-4 text-center">
              <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);