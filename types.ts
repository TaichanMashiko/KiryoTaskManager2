
export type Status = '未着手' | '進行中' | '完了';
export type Priority = '高' | '中' | '低';
export type View = 'table' | 'kanban' | 'gantt';

export interface Task {
  id: string;
  name: string;
  description: string;
  assignee: string; // user email
  category: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  status: Status;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface User {
  email: string;
  name: string;
  role: 'admin' | 'member';
}

export interface Category {
  id: string;
  name: string;
}
