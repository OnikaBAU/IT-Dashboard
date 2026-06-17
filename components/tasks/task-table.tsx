"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Eye, XCircle, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TaskForm } from "@/components/tasks/task-form";
import { deleteTask, closeTask, reopenTask } from "@/lib/actions/tasks";
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/types";
import type { TaskWithUser } from "@/lib/types";

interface TaskTableProps {
  tasks: TaskWithUser[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  const router = useRouter();
  const [editTask, setEditTask] = useState<TaskWithUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    setActionLoading(deleteId);
    try {
      await deleteTask(deleteId);
      toast.success("Task deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setActionLoading(null);
      setDeleteId(null);
    }
  }

  async function handleClose(id: string) {
    setActionLoading(id);
    try {
      await closeTask(id);
      toast.success("Task closed");
      router.refresh();
    } catch {
      toast.error("Failed to close task");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReopen(id: string) {
    setActionLoading(id);
    try {
      await reopenTask(id);
      toast.success("Task reopened");
      router.refresh();
    } catch {
      toast.error("Failed to reopen task");
    } finally {
      setActionLoading(null);
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm mt-1">Create a task to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Ticket #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Link href={`/tasks/${task.id}`} className="font-mono text-sm text-primary hover:underline">
                    {task.ticketNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/tasks/${task.id}`} className="font-medium hover:text-primary hover:underline max-w-xs block truncate">
                    {task.title}
                  </Link>
                  {task.category && <span className="text-xs text-muted-foreground">{task.category}</span>}
                </TableCell>
                <TableCell className="text-sm">
                  {task.user ? (
                    <Link href={`/users/${task.user.id}`} className="hover:text-primary hover:underline">
                      {task.user.fullName}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{task.assignedTo ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(task.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      disabled={actionLoading === task.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent disabled:opacity-50"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/tasks/${task.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditTask(task)}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {task.status !== "CLOSED" ? (
                        <DropdownMenuItem
                          onClick={() => handleClose(task.id)}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" /> Close Task
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleReopen(task.id)}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" /> Reopen Task
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(task.id)}
                        className="text-destructive flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TaskForm open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)} task={editTask} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task and all its notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
