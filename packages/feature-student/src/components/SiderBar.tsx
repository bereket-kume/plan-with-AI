import { LayoutDashboard, BookOpen, Calendar, BarChart3, User, Settings } from 'lucide-react';

export const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
    { icon: <BookOpen size={20} />, label: 'Tasks', active: false },
    { icon: <Calendar size={20} />, label: 'Calendar', active: false },
    { icon: <BarChart3 size={20} />, label: 'Analytics', active: false },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 h-screen sticky top-0">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-indigo-900">StudyAI</h1>
        <p className="text-xs text-slate-400">Learning Partner</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              item.active 
                ? 'bg-indigo-50 text-indigo-700 font-semibold border-r-4 border-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="pt-6 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer">
          <User size={20} />
          <span className="text-sm">Profile</span>
        </div>
        <div className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer">
          <Settings size={20} />
          <span className="text-sm">Settings</span>
        </div>
      </div>
    </aside>
  );
};