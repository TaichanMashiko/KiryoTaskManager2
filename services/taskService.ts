import { Task, User, Category, Comment, Priority, Status } from '../types';
import { API_KEY, CLIENT_ID, SPREADSHEET_ID } from './googleConfig';

const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let gapi: any;
let google: any;

/**
 * GAPIクライアントを初期化し、サインイン状態を監視します。
 */
export const initClient = (updateSigninStatus: (isSignedIn: boolean) => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      // FIX: Cast window to any to access gapi property loaded from external script.
      gapi = (window as any).gapi;
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
          });
          // FIX: Cast window to any to access google property loaded from external script.
          google = (window as any).google;
          // サインイン状態の変更をリッスン
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
          // 初回読み込み時のサインイン状態を更新
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export const signIn = () => gapi.auth2.getAuthInstance().signIn();
export const signOut = () => gapi.auth2.getAuthInstance().signOut();

export const getSignedInUser = (): { name: string; email: string; picture: string } | null => {
  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance.isSignedIn.get()) return null;
  const profile = authInstance.currentUser.get().getBasicProfile();
  return {
    name: profile.getName(),
    email: profile.getEmail(),
    picture: profile.getImageUrl(),
  };
};

// --- ヘルパー関数 ---
const sheetValuesToObject = <T>(values: any[][], headers: string[]): T[] => {
  if (!values || values.length === 0) return [];
  return values.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj as T;
  });
};

const objectToSheetValues = (obj: any, headers: string[]): any[] => {
  return headers.map(header => obj[header] || '');
};

const getSheetData = async (range: string) => {
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
    });
    return response.result.values || [];
};

// --- データ取得関数 ---
export const getTasks = async (): Promise<Task[]> => {
  const values = await getSheetData('タスク!A2:K');
  return values.map((row: any[]) => ({
    id: row[0],
    name: row[1],
    description: row[2],
    assignee: row[3],
    category: row[4],
    startDate: row[5],
    dueDate: row[6],
    priority: row[7] as Priority,
    status: row[8] as Status,
    createdAt: row[9],
    updatedAt: row[10],
  }));
};

export const getUsers = async (): Promise<User[]> => {
  const values = await getSheetData('ユーザーマスタ!A2:C');
  return values.map((row: any[]) => ({
    email: row[0],
    name: row[1],
    role: row[2] as 'admin' | 'member',
  }));
};

export const getCategories = async (): Promise<Category[]> => {
    const values = await getSheetData('カテゴリマスタ!A2:B');
    return values.map((row: any[]) => ({
      id: row[0],
      name: row[1],
    }));
};

export const getComments = async (taskId: string): Promise<Comment[]> => {
    const values = await getSheetData('コメント!A2:F');
    return values
      .filter((row: any[]) => row[1] === taskId)
      .map((row: any[]) => ({
        id: row[0],
        taskId: row[1],
        userId: row[2],
        userName: row[3],
        text: row[4],
        createdAt: row[5],
      }));
};

// --- データ更新関数 ---
export const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const newId = `TASK-${Date.now()}`;
    const now = new Date().toISOString();
    const newTask: Task = {
        ...taskData,
        id: newId,
        createdAt: now,
        updatedAt: now,
    };

    const values = [[
        newTask.id, newTask.name, newTask.description, newTask.assignee, 
        newTask.category, newTask.startDate, newTask.dueDate, newTask.priority,
        newTask.status, newTask.createdAt, newTask.updatedAt
    ]];

    await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'タスク!A:K',
        valueInputOption: 'USER_ENTERED',
        resource: { values },
    });
    return newTask;
};

export const updateTask = async (updatedTask: Task): Promise<Task> => {
    const taskWithUpdateDate = { ...updatedTask, updatedAt: new Date().toISOString() };
    const allTasks = await getSheetData('タスク!A1:K');
    const rowIndex = allTasks.findIndex((row: any[]) => row[0] === updatedTask.id);

    if (rowIndex === -1) throw new Error('Task not found');
    
    const rowNumber = rowIndex + 1; // 1-based index
    const range = `タスク!A${rowNumber}:K${rowNumber}`;
    
    const values = [[
        taskWithUpdateDate.id, taskWithUpdateDate.name, taskWithUpdateDate.description, taskWithUpdateDate.assignee,
        taskWithUpdateDate.category, taskWithUpdateDate.startDate, taskWithUpdateDate.dueDate, taskWithUpdateDate.priority,
        taskWithUpdateDate.status, taskWithUpdateDate.createdAt, taskWithUpdateDate.updatedAt
    ]];

    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
    });
    return taskWithUpdateDate;
};

export const deleteTask = async (taskId: string): Promise<{ success: boolean }> => {
    const allTasks = await getSheetData('タスク!A:A');
    const rowIndex = allTasks.findIndex(row => row[0] === taskId);

    if (rowIndex === -1) throw new Error('Task not found');
    
    const sheetInfo = await gapi.client.sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID, ranges: ['タスク'] });
    const sheetId = sheetInfo.result.sheets.find((s:any) => s.properties.title === 'タスク')?.properties.sheetId;

    if (sheetId === undefined) throw new Error('Task sheet not found');
    
    await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: 'ROWS',
                        startIndex: rowIndex,
                        endIndex: rowIndex + 1,
                    },
                },
            }],
        },
    });

    return { success: true };
};


export const addComment = async (commentData: { taskId: string; userId: string; text: string }): Promise<Comment> => {
    const user = getSignedInUser();
    const newComment: Comment = {
        id: `CMT-${Date.now()}`,
        taskId: commentData.taskId,
        userId: commentData.userId,
        userName: user?.name || 'Unknown User',
        text: commentData.text,
        createdAt: new Date().toISOString(),
    };

    const values = [[
        newComment.id, newComment.taskId, newComment.userId,
        newComment.userName, newComment.text, newComment.createdAt
    ]];

    await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'コメント!A:F',
        valueInputOption: 'USER_ENTERED',
        resource: { values },
    });
    return newComment;
};