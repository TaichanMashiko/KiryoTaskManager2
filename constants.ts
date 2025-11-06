
import { Status, Priority } from './types';

export const STATUSES: Status[] = ['未着手', '進行中', '完了'];
export const PRIORITIES: Priority[] = ['高', '中', '低'];

export const PRIORITY_COLORS: Record<Priority, string> = {
  '高': 'bg-red-900/50 hover:bg-red-800/60',
  '中': 'bg-yellow-900/50 hover:bg-yellow-800/60',
  '低': 'bg-blue-900/50 hover:bg-blue-800/60',
};

export const GANTT_PRIORITY_COLORS: Record<Priority, string> = {
  '高': 'bg-red-500',
  '中': 'bg-yellow-500',
  '低': 'bg-blue-500',
};

export const STATUS_COLORS: Record<Status, string> = {
    '未着手': 'border-gray-500',
    '進行中': 'border-blue-500',
    '完了': 'border-green-500',
}

export const KANBAN_COLUMN_STYLES: Record<Status, string> = {
    '未着手': 'bg-gray-700/50',
    '進行中': 'bg-blue-900/40',
    '完了': 'bg-green-900/40',
};
