import type { Priority, Status } from "./generated/prisma/enums";

export type { Priority, Status };

export type UserWithTaskCount = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  department: string | null;
  position: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { tasks: number };
};

export type TaskWithUser = {
  id: string;
  ticketNumber: string;
  userId: string | null;
  title: string;
  description: string | null;
  category: string | null;
  priority: Priority;
  status: Status;
  assignedTo: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; fullName: string; email: string } | null;
};

export type TaskNoteWithAuthor = {
  id: string;
  taskId: string;
  authorId: string | null;
  content: string;
  imageUrls: string[];
  createdAt: Date;
  author: { id: string; fullName: string } | null;
};

export type ActivityLogWithRelations = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  taskId: string | null;
  userId: string | null;
  details: string | null;
  createdAt: Date;
  user: { id: string; fullName: string } | null;
  task: { id: string; ticketNumber: string; title: string } | null;
};

export type DashboardStats = {
  totalUsers: number;
  openTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
};

export const TASK_CATEGORIES = [
  "Hardware",
  "Software",
  "Network",
  "Security",
  "Account Access",
  "Email",
  "Printing",
  "Database",
  "Server",
  "Other",
] as const;

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const STATUS_LABELS: Record<Status, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  WAITING: "Waiting",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const STATUS_COLORS: Record<Status, string> = {
  OPEN: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  WAITING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CLOSED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};
