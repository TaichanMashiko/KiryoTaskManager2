import React from 'react';
import { View, User } from '../types';
import { PlusIcon, TableIcon, KanbanIcon, GanttChartIcon } from './icons';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onNewTask: () => void;
  user: User | null;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onNewTask, user, onSignOut }) => {
  const commonButtonClasses = "px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-200";
  const activeButtonClasses = "bg-indigo-600 text-white shadow-lg";
  const inactiveButtonClasses = "bg-gray-700 hover:bg-gray-600 text-gray-300";

  return (
    <header className="flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 className="text-3xl font-bold text-white tracking-wider">
        KiryoTaskManager
      </h1>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex bg-gray-700 p-1 rounded-lg">
           <button 
             onClick={() => onViewChange('table')}
             className={`${commonButtonClasses} ${currentView === 'table' ? activeButtonClasses : inactiveButtonClasses} text-sm`}
           >
             <TableIcon className="w-5 h-5" />
             Table
           </button>
           <button 
             onClick={() => onViewChange('kanban')}
             className={`${commonButtonClasses} ${currentView === 'kanban' ? activeButtonClasses : inactiveButtonClasses} text-sm`}
           >
             <KanbanIcon className="w-5 h-5" />
             Kanban
           </button>
           <button 
             onClick={() => onViewChange('gantt')}
             className={`${commonButtonClasses} ${currentView === 'gantt' ? activeButtonClasses : inactiveButtonClasses} text-sm`}
           >
             <GanttChartIcon className="w-5 h-5" />
             Gantt
           </button>
        </div>
        <button
          onClick={onNewTask}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors duration-200 shadow-md"
        >
          <PlusIcon className="w-5 h-5" />
          New Task
        </button>
        {user && (
          <div className="flex items-center gap-3 bg-gray-700 p-1 pr-3 rounded-lg">
            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-md" />
            <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
            <button onClick={onSignOut} className="text-xs bg-red-600/80 hover:bg-red-700/80 text-white px-2 py-1 rounded-md transition">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
