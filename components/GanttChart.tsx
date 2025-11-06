
import React, { useMemo } from 'react';
import { Task, User } from '../types';
import { GANTT_PRIORITY_COLORS } from '../constants';
import Tooltip from './Tooltip';
import { GanttChartIcon } from './icons';

interface GanttChartProps {
  tasks: Task[];
  users: User[];
  onEditTask: (task: Task) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, users, onEditTask }) => {
  const usersMap = useMemo(() => new Map(users.map(u => [u.email, u.name])), [users]);

  const { chartStartDate, chartEndDate, totalDays, dateHeaders, todayOffset } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 15);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 15);
      return { chartStartDate: startDate, chartEndDate: endDate, totalDays: 31, dateHeaders: [], todayOffset: 15 };
    }

    const startDates = tasks.map(t => new Date(t.startDate));
    const endDates = tasks.map(t => new Date(t.dueDate));

    const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));
    
    // Add padding days
    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 2);

    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24)) + 1;

    const headers: { month: string; days: string[] }[] = [];
    let currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      const month = currentDate.toLocaleString('default', { month: 'short' });
      let monthGroup = headers.find(h => h.month === month);
      if (!monthGroup) {
        monthGroup = { month, days: [] };
        headers.push(monthGroup);
      }
      monthGroup.days.push(String(currentDate.getDate()));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayOffset = (today >= minDate && today <= maxDate)
      ? Math.floor((today.getTime() - minDate.getTime()) / (1000 * 3600 * 24))
      : -1;

    return { chartStartDate: minDate, chartEndDate: maxDate, totalDays, dateHeaders: headers, todayOffset };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-800/50 rounded-lg p-8 text-center">
        <GanttChartIcon className="w-16 h-16 text-indigo-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No tasks to display</h2>
        <p className="text-gray-400">Create a new task to see the Gantt chart.</p>
      </div>
    );
  }

  const getTaskPosition = (task: Task) => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.dueDate);

    const startOffset = Math.max(0, Math.floor((startDate.getTime() - chartStartDate.getTime()) / (1000 * 3600 * 24)));
    const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1);

    return {
      gridColumnStart: startOffset + 2,
      gridColumnEnd: startOffset + 2 + duration,
    };
  };

  return (
    <div className="overflow-x-auto bg-gray-900/50 p-4 rounded-lg text-sm">
      <div className="grid" style={{ gridTemplateColumns: `minmax(200px, 1fr) repeat(${totalDays}, minmax(40px, 1fr))`, minWidth: '1200px' }}>
        {/* Header: Task Name */}
        <div className="sticky left-0 bg-gray-700/80 backdrop-blur-sm z-20 border-r border-b border-gray-600 p-2 font-semibold text-center">Task</div>

        {/* Header: Dates */}
        {dateHeaders.map(({ month, days }) => (
          <React.Fragment key={month}>
            <div className="border-b border-gray-600 font-semibold text-center p-1" style={{ gridColumn: `span ${days.length}` }}>
              {month}
            </div>
          </React.Fragment>
        ))}
        
        <div className="sticky left-0 bg-gray-700/80 backdrop-blur-sm z-20 border-r border-gray-600"></div>

        {dateHeaders.flatMap(({ days }) => days).map((day, i) => (
           <div key={i} className="border-r border-b border-gray-600 text-center font-mono text-xs py-1">
             {day}
           </div>
        ))}
        
        {/* Today Marker */}
        {todayOffset !== -1 && (
            <div 
              className="absolute h-full top-0 border-r-2 border-red-500/70 z-10"
              style={{ left: `${200 + todayOffset * 40}px`, gridRow: '1 / span 9999' }}
            >
              <div className="sticky top-0 bg-red-500 text-white text-xs font-bold px-1 rounded-b-md">Today</div>
            </div>
        )}
        
        {/* Task Rows */}
        {tasks.map((task, index) => (
          <React.Fragment key={task.id}>
            {/* Task Name Column */}
            <div
              className="sticky left-0 bg-gray-800 z-10 border-r border-b border-gray-600 p-2 truncate cursor-pointer hover:text-indigo-400"
              onClick={() => onEditTask(task)}
              style={{ gridRow: index + 3 }}
            >
              {task.name}
            </div>

            {/* Timeline Grid Cells for the row */}
            {Array.from({ length: totalDays }).map((_, i) => (
              <div
                key={i}
                className="border-r border-b border-gray-700"
                style={{ gridRow: index + 3, gridColumn: i + 2 }}
              ></div>
            ))}

            {/* Task Bar */}
            <div
              className="h-full flex items-center"
              style={{ gridRow: index + 3, ...getTaskPosition(task) }}
            >
              <Tooltip
                content={
                  <div>
                    <p className="font-bold">{task.name}</p>
                    <p>{task.startDate} to {task.dueDate}</p>
                    <p>Assignee: {usersMap.get(task.assignee) || 'Unassigned'}</p>
                  </div>
                }
              >
                <div
                  onClick={() => onEditTask(task)}
                  className={`h-6 w-full rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer flex items-center px-2 overflow-hidden ${GANTT_PRIORITY_COLORS[task.priority]}`}
                >
                    <span className="text-xs font-semibold text-white truncate">{task.name}</span>
                </div>
              </Tooltip>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GanttChart;
