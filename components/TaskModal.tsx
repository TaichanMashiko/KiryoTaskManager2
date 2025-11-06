
import React, { useState, useEffect } from 'react';
import { Task, User, Category, Status, Priority } from '../types';
import { STATUSES, PRIORITIES } from '../constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Task) => void;
  task: Task | null;
  users: User[];
  categories: Category[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, users, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assignee: '',
    category: '',
    startDate: '',
    dueDate: '',
    priority: '中' as Priority,
    status: '未着手' as Status,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description,
        assignee: task.assignee,
        category: task.category,
        startDate: task.startDate,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
      });
    } else {
      // Reset for new task
      setFormData({
        name: '',
        description: '',
        assignee: users.length > 0 ? users[0].email : '',
        category: categories.length > 0 ? categories[0].name : '',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        priority: '中',
        status: '未着手',
      });
    }
  }, [task, users, categories, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task) {
      onSave({ ...task, ...formData });
    } else {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">{task ? 'Edit Task' : 'Create New Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Task Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-700 p-2 mt-1 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-gray-700 p-2 mt-1 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-300">Assignee</label>
              <select name="assignee" id="assignee" value={formData.assignee} onChange={handleChange} required className="w-full bg-gray-700 p-2 mt-1 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                {users.map(u => <option key={u.email} value={u.email}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
               <input list="category-suggestions" name="category" id="category" value={formData.category} onChange={handleChange} required className="w-full bg-gray-700 p-2 mt-1 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
               <datalist id="category-suggestions">
                 {categories.map(c => <option key={c.id} value={c.name} />)}
               </datalist>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Start Date</label>
              <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="w-full bg-gray-700 p-2 mt-1 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300">Due Date</label>
              <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} required className="w-full bg-gray-700 p-2 mt-1 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-300">Priority</label>
              <select name="priority" id="priority" value={formData.priority} onChange={handleChange} required className="w-full bg-gray-700 p-2 mt-1 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300">Status</label>
              <select name="status" id="status" value={formData.status} onChange={handleChange} required className="w-full bg-gray-700 p-2 mt-1 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
