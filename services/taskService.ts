
import { Task, User, Category, Priority, Status } from '../types';

// --- MOCK DATABASE ---
// This simulates the data that would be fetched from the Google Sheets.
let tasks: Task[] = [
  { id: 'TASK-001', name: 'UI設計の完了', description: 'Figmaでメイン画面のUIデザインを完成させる。', assignee: 'user1@example.com', category: 'デザイン', startDate: '2023-10-01', dueDate: '2023-10-05', priority: '高', status: '完了', createdAt: '2023-10-01T10:00:00Z', updatedAt: '2023-10-05T15:00:00Z' },
  { id: 'TASK-002', name: 'APIエンドポイント実装', description: 'タスク取得用のAPIを作成する。', assignee: 'user2@example.com', category: 'バックエンド', startDate: '2023-10-06', dueDate: '2023-10-10', priority: '高', status: '進行中', createdAt: '2023-10-02T11:00:00Z', updatedAt: '2023-10-08T14:00:00Z' },
  { id: 'TASK-003', name: 'テーブル表示コンポーネント作成', description: 'Reactでタスク一覧を表示するコンポーネントを実装。', assignee: 'user1@example.com', category: 'フロントエンド', startDate: '2023-10-08', dueDate: '2023-10-12', priority: '中', status: '進行中', createdAt: '2023-10-03T12:00:00Z', updatedAt: '2023-10-09T18:00:00Z' },
  { id: 'TASK-004', name: 'ユーザー認証機能の調査', description: 'OAuth 2.0を利用した認証方法を調査する。', assignee: 'user3@example.com', category: 'インフラ', startDate: '2023-10-11', dueDate: '2023-10-15', priority: '低', status: '未着手', createdAt: '2023-10-04T13:00:00Z', updatedAt: '2023-10-04T13:00:00Z' },
  { id: 'TASK-005', name: '単体テストの実装', description: 'APIの単体テストをJestで記述する。', assignee: 'user2@example.com', category: 'テスト', startDate: '2023-10-13', dueDate: '2023-10-18', priority: '中', status: '未着手', createdAt: '2023-10-05T14:00:00Z', updatedAt: '2023-10-05T14:00:00Z' },
  { id: 'TASK-006', name: 'かんばんボードUIの実装', description: 'ドラッグ＆ドロップ機能を実装する。', assignee: 'user1@example.com', category: 'フロントエンド', startDate: '2023-10-14', dueDate: '2023-10-20', priority: '高', status: '未着手', createdAt: '2023-10-06T15:00:00Z', updatedAt: '2023-10-06T15:00:00Z' },
];

const users: User[] = [
  { email: 'user1@example.com', name: 'Taro Yamada', role: 'admin' },
  { email: 'user2@example.com', name: 'Hanako Suzuki', role: 'member' },
  { email: 'user3@example.com', name: 'Jiro Tanaka', role: 'member' },
];

const categories: Category[] = [
  { id: 'CAT-1', name: 'デザイン' },
  { id: 'CAT-2', name: 'バックエンド' },
  { id: 'CAT-3', name: 'フロントエンド' },
  { id: 'CAT-4', name: 'インフラ' },
  { id: 'CAT-5', name: 'テスト' },
];

// --- MOCK API FUNCTIONS ---
// These functions simulate network delay with setTimeout.

const simulateNetwork = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 500 + Math.random() * 500);
  });
};

export const getTasks = (): Promise<Task[]> => simulateNetwork(tasks);
export const getUsers = (): Promise<User[]> => simulateNetwork(users);
export const getCategories = (): Promise<Category[]> => simulateNetwork(categories);

export const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newIdNumber = Math.max(0, ...tasks.map(t => parseInt(t.id.split('-')[1]))) + 1;
      const newTask: Task = {
        ...taskData,
        id: `TASK-${String(newIdNumber).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      tasks.push(newTask);
      resolve(JSON.parse(JSON.stringify(newTask)));
    }, 500);
  });
};

export const updateTask = (updatedTask: Task): Promise<Task> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = tasks.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
        tasks[index] = { ...updatedTask, updatedAt: new Date().toISOString() };
        resolve(JSON.parse(JSON.stringify(tasks[index])));
      } else {
        reject(new Error('Task not found'));
      }
    }, 500);
  });
};

export const deleteTask = (taskId: string): Promise<{ success: boolean }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = tasks.length;
      tasks = tasks.filter(t => t.id !== taskId);
      if (tasks.length < initialLength) {
        resolve({ success: true });
      } else {
        reject(new Error('Task not found'));
      }
    }, 500);
  });
};
