import React, { useState, useMemo } from 'react';
import { Task, User, Status, Priority } from '../types';
import { PRIORITY_COLORS, STATUSES } from '../constants';
// FIX: Removed unused UserIcon and FilterIcon imports which are not exported from './icons'.
import { EditIcon, DeleteIcon, SortAscIcon, SortDescIcon } from './icons';
import Tooltip from './Tooltip';

interface TaskTableProps {
  tasks: Task[];
  users: User[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  currentUser: User;
}

type SortKey = keyof Task | '';
type SortDirection = 'asc' | 'desc';

const TaskTable: React.FC<TaskTableProps> = ({ tasks, users, onEdit, onDelete, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const usersMap = useMemo(() => new Map(users.map(u => [u.email, u.name])), [users]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    if (showMyTasks) {
      filtered = filtered.filter(task => task.assignee === currentUser.email);
    }
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(lowercasedTerm) ||
        task.description.toLowerCase().includes(lowercasedTerm) ||
        task.id.toLowerCase().includes(lowercasedTerm)
      );
    }
    if (assigneeFilter) {
      filtered = filtered.filter(task => task.assignee === assigneeFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (sortKey) {
      filtered.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [tasks, searchTerm, assigneeFilter, statusFilter, showMyTasks, sortKey, sortDirection, currentUser.email]);
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? <SortAscIcon className="w-4 h-4" /> : <SortDescIcon className="w-4 h-4" />;
  };

  const headers: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Task Name' },
    { key: 'assignee', label: 'Assignee' },
    { key: 'category', label: 'Category' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="overflow-x-auto">
      {/* Filter Controls */}
      <div className="mb-4 p-4 bg-gray-900/50 rounded-lg flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search tasks..."
          className="bg-gray-700 p-2 rounded-md flex-grow"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="bg-gray-700 p-2 rounded-md">
          <option value="">All Assignees</option>
          {users.map(u => <option key={u.email} value={u.email}>{u.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as Status | '')} className="bg-gray-700 p-2 rounded-md">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showMyTasks} onChange={e => setShowMyTasks(e.target.checked)} className="form-checkbox h-5 w-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" />
          My Tasks Only
        </label>
      </div>

      <table className="w-full text-left table-auto">
        <thead className="bg-gray-700/50 text-gray-300 uppercase text-sm">
          <tr>
            {headers.map(header => (
              <th key={header.key} className="p-3 cursor-pointer" onClick={() => handleSort(header.key)}>
                <div className="flex items-center gap-2">{header.label} {renderSortIcon(header.key)}</div>
              </th>
            ))}
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedTasks.map(task => (
            <tr key={task.id} className={`border-b border-gray-700 transition-colors duration-200 ${PRIORITY_COLORS[task.priority]}`}>
              <td className="p-3">
                 <Tooltip content={<div className="text-sm"><p className="font-bold">{task.id}</p><p>{task.description}</p></div>}>
                    <span className="font-medium">{task.name}</span>
                 </Tooltip>
              </td>
              <td className="p-3">{usersMap.get(task.assignee) || task.assignee}</td>
              <td className="p-3">{task.category}</td>
              <td className="p-3">{task.dueDate}</td>
              <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span></td>
              <td className="p-3">{task.status}</td>
              <td className="p-3 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(task)} className="p-2 text-gray-400 hover:text-white transition"><EditIcon className="w-5 h-5" /></button>
                  <button onClick={() => onDelete(task.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><DeleteIcon className="w-5 h-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredAndSortedTasks.length === 0 && (
          <div className="text-center p-8 text-gray-500">No tasks found.</div>
      )}
    </div>
  );
};

export default TaskTable;