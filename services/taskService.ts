import { Task, User, Category } from '../types';

// 重要: このURLを、ステップ1でコピーしたご自身のGoogle Apps ScriptのウェブアプリURLに置き換えてください。
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwWnw6Bcv8nvYFMO0-TPkkb-xMwe-t1yNT4FQaIwlalofBPB6KRH99eyT0R1edSJDdfKQ/exec';

// Google Apps Script APIを呼び出すための汎用的なfetchハンドラ
const apiFetch = async <T>(action: string, method: 'GET' | 'POST' = 'GET', payload?: any): Promise<T> => {
  let url = `${SCRIPT_URL}?action=${action}`;
  const options: RequestInit = {
    method,
    // GASのPOSTリクエストではリダイレクトをフォローする必要があります
    redirect: 'follow', 
  };

  if (method === 'POST') {
    // GASではContent-Typeをtext/plainにする必要があります
    options.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
    options.body = JSON.stringify({ action, payload });
    // POSTの場合、アクションはボディに含まれるため、URLはクリーンにします
    url = SCRIPT_URL; 
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTPエラー！ステータス: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'APIでエラーが発生しました');
    }
    return result.data as T;
  } catch (error) {
    console.error(`API呼び出し失敗 (アクション: "${action}"):`, error);
    throw error; // エラーを呼び出し元のコンポーネントに再スロー
  }
};


export const getTasks = (): Promise<Task[]> => apiFetch<Task[]>('getTasks');
export const getUsers = (): Promise<User[]> => apiFetch<User[]>('getUsers');
export const getCategories = (): Promise<Category[]> => apiFetch<Category[]>('getCategories');

export const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  return apiFetch<Task>('addTask', 'POST', taskData);
};

export const updateTask = (updatedTask: Task): Promise<Task> => {
  return apiFetch<Task>('updateTask', 'POST', updatedTask);
};

export const deleteTask = (taskId: string): Promise<{ success: boolean }> => {
  return apiFetch<{ success: boolean }>('deleteTask', 'POST', { taskId });
};