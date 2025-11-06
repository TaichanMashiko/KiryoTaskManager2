import React, { useState, useEffect, useCallback } from 'react';
import { Task, User, Category, View } from './types';
import { 
  initClient, 
  signIn, 
  signOut, 
  getSignedInUser,
  getTasks, 
  getUsers, 
  getCategories, 
  addTask as addTaskService, 
  updateTask as updateTaskService, 
  deleteTask as deleteTaskService 
} from './services/taskService';
import Header from './components/Header';
import TaskTable from './components/TaskTable';
import KanbanBoard from './components/KanbanBoard';
import GanttChart from './components/GanttChart';
import TaskModal from './components/TaskModal';
import LoadingSpinner from './components/LoadingSpinner';
import { GoogleIcon } from './components/icons';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [gapiReady, setGapiReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initClient((signedIn) => {
          setIsSignedIn(signedIn);
          if (signedIn) {
            const user = getSignedInUser();
            if(user) {
              setCurrentUser({email: user.email, name: user.name, role: 'admin', picture: user.picture });
            }
          } else {
            setCurrentUser(null);
          }
          setGapiReady(true);
        });
      } catch (err) {
        setError("Failed to initialize Google API. Please check your configuration.");
        console.error(err);
        setGapiReady(true); // Stop loading even on error
      }
    };
    initialize();
  }, []);
  
  const loadData = useCallback(async () => {
    if (!isSignedIn) return;
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
      setError('Failed to load data. Please check spreadsheet permissions and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (gapiReady && isSignedIn) {
      loadData();
    }
  }, [gapiReady, isSignedIn, loadData]);

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

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
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
    if (error && !loading) {
      return <div className="text-center text-red-400 mt-8 p-4 bg-red-900/30 rounded-lg">{error}</div>;
    }
    switch(currentView) {
      case 'table':
        return <TaskTable tasks={tasks} users={users} onEdit={handleOpenModal} onDelete={handleDeleteTask} currentUser={currentUser!} />;
      case 'kanban':
        return <KanbanBoard tasks={tasks} onUpdateStatus={handleUpdateTaskStatus} onEditTask={handleOpenModal} />;
      case 'gantt':
        return <GanttChart tasks={tasks} onEditTask={handleOpenModal} users={users} />;
      default:
        return <TaskTable tasks={tasks} users={users} onEdit={handleOpenModal} onDelete={handleDeleteTask} currentUser={currentUser!} />;
    }
  };

  if (!gapiReady) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-4xl font-bold text-white tracking-wider mb-4">KiryoTaskManager</h1>
        <p className="text-gray-400 mb-8">Sign in with your Google Account to manage your tasks.</p>
        <button
          onClick={signIn}
          className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition-colors"
        >
          <GoogleIcon className="w-6 h-6" />
          Sign in with Google
        </button>
        {error && <div className="text-red-400 mt-4">{error}</div>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <Header 
          currentView={currentView}
          onViewChange={setCurrentView}
          onNewTask={() => handleOpenModal()}
          user={currentUser}
          onSignOut={signOut}
        />
        <main className="mt-8 bg-gray-800 rounded-lg shadow-2xl p-4 md:p-6 relative">
          {loading && tasks.length > 0 && <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-20"><LoadingSpinner /></div>}
          {renderContent()}
        </main>
      </div>
      {isModalOpen && currentUser && (
        <TaskModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          task={editingTask}
          users={users}
          categories={categories}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default App;
