export type Priority = "low" | "medium" | "high";

export type TaskStatus = "backlog" | "in-progress" | "in-review" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  assignee: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null; // ISO yyyy-mm-dd
}
