
import React, { useState, useEffect, useCallback } from 'react';
import { Task, User, Category, Status, Priority, View } from './types';
import { getTasks, getUsers, getCategories, addTask as addTaskService, updateTask as updateTaskService, deleteTask as deleteTaskService } from './services/taskService';
import Header from './components/Header';
import TaskTable from './components/TaskTable';
import KanbanBoard from './components/KanbanBoard';
import GanttChart from './components/GanttChart';
import TaskModal from './components/TaskModal';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Mock current user
  const currentUser: User = { email: 'user1@example.com', name: 'Taro Yamada', role: 'admin' };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksData, usersData, categoriesData] = await Promise.all([
        getTasks(),
        getUsers(),
        getCategories(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Task) => {
    setLoading(true);
    try {
      if ('id' in taskData) {
        const updatedTask = await updateTaskService(taskData);
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      } else {
        const newTask = await addTaskService(taskData);
        setTasks([...tasks, newTask]);
      }
      handleCloseModal();
    } catch (err) {
      setError('Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await deleteTaskService(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (err) {
        setError('Failed to delete task.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Status) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate && taskToUpdate.status !== newStatus) {
      setLoading(true);
      try {
        const updatedTask = await updateTaskService({ ...taskToUpdate, status: newStatus });
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      } catch (err) {
        setError('Failed to update task status.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const renderContent = () => {
    if (loading && tasks.length === 0) {
      return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }
    if (error) {
      return <div className="text-center text-red-400 mt-8">{error}</div>;
    }
    switch(currentView) {
      case 'table':
        return <TaskTable tasks={tasks} users={users} onEdit={handleOpenModal} onDelete={handleDeleteTask} currentUser={currentUser} />;
      case 'kanban':
        return <KanbanBoard tasks={tasks} onUpdateStatus={handleUpdateTaskStatus} onEditTask={handleOpenModal} />;
      case 'gantt':
        return <GanttChart />;
      default:
        return <TaskTable tasks={tasks} users={users} onEdit={handleOpenModal} onDelete={handleDeleteTask} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <Header 
          currentView={currentView}
          onViewChange={setCurrentView}
          onNewTask={() => handleOpenModal()}
        />
        <main className="mt-8 bg-gray-800 rounded-lg shadow-2xl p-4 md:p-6 relative">
          {loading && tasks.length > 0 && <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-20"><LoadingSpinner /></div>}
          {renderContent()}
        </main>
      </div>
      {isModalOpen && (
        <TaskModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          task={editingTask}
          users={users}
          categories={categories}
        />
      )}
    </div>
  );
};

export default App;
