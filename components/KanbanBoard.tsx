
import React, { useState } from 'react';
import { Task, Status } from '../types';
import { STATUSES, KANBAN_COLUMN_STYLES, PRIORITY_COLORS, STATUS_COLORS } from '../constants';
import { EditIcon } from './icons';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: Status) => void;
  onEditTask: (task: Task) => void;
}

const KanbanCard: React.FC<{ task: Task; onDragStart: (e: React.DragEvent, taskId: string) => void; onEditTask: (task: Task) => void; }> = ({ task, onDragStart, onEditTask }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`p-4 mb-4 bg-gray-800 rounded-lg shadow-md cursor-grab active:cursor-grabbing border-l-4 ${STATUS_COLORS[task.status]} ${PRIORITY_COLORS[task.priority]}`}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-bold mb-2 text-gray-100">{task.name}</h4>
        <button onClick={() => onEditTask(task)} className="p-1 text-gray-400 hover:text-white transition-colors duration-200">
            <EditIcon className="w-4 h-4"/>
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-2">{task.description}</p>
      <div className="text-xs text-gray-500 flex justify-between">
        <span>Due: {task.dueDate}</span>
        <span>{task.id}</span>
      </div>
    </div>
  );
};

const KanbanColumn: React.FC<{ 
    status: Status; 
    tasks: Task[]; 
    onDragStart: (e: React.DragEvent, taskId: string) => void; 
    onDrop: (e: React.DragEvent, status: Status) => void;
    onDragOver: (e: React.DragEvent) => void;
    onEditTask: (task: Task) => void;
    isOver: boolean;
}> = ({ status, tasks, onDragStart, onDrop, onDragOver, onEditTask, isOver }) => {
  return (
    <div
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
      className={`flex-1 min-w-[300px] p-4 rounded-lg ${KANBAN_COLUMN_STYLES[status]} transition-colors duration-300 ${isOver ? 'bg-gray-600/50' : ''}`}
    >
      <h3 className="text-lg font-semibold mb-4 text-white uppercase tracking-wider">{status} ({tasks.length})</h3>
      <div className="space-y-4 h-[calc(100vh-20rem)] overflow-y-auto pr-2">
        {tasks.map(task => (
          <KanbanCard key={task.id} task={task} onDragStart={onDragStart} onEditTask={onEditTask} />
        ))}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onUpdateStatus, onEditTask }) => {
  const [draggedOverColumn, setDraggedOverColumn] = useState<Status | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, newStatus: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    onUpdateStatus(taskId, newStatus);
    setDraggedOverColumn(null);
  };

  const handleDragEnter = (status: Status) => {
    setDraggedOverColumn(status);
  };
  
  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {STATUSES.map(status => (
        <div key={status} onDragEnter={() => handleDragEnter(status)} onDragLeave={handleDragLeave}>
            <KanbanColumn
                status={status}
                tasks={tasks.filter(task => task.status === status)}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onEditTask={onEditTask}
                isOver={draggedOverColumn === status}
            />
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
