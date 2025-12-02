export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type ViewType = 'board' | 'list' | 'calendar' | 'analytics' | 'notes' | 'goals' | 'image-studio';

export interface Project {
  id: string;
  name: string;
  color: string;
  status: 'active' | 'archived';
  created: string;
  parentId?: string; // ID of the parent project, if this is a sub-project
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  dueDate: string;
  tags: string[];
  timeSpent: number; // in minutes
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  targetDate: string;
  progress: number; // 0-100
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}