"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, XCircle, RefreshCw, Trash2, MoreHorizontal } from "lucide-react";
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
import { closeTask, reopenTask, deleteTask } from "@/lib/actions/tasks";
import type { TaskWithUser } from "@/lib/types";

interface TaskActionsProps {
  task: TaskWithUser;
}

export function TaskActions({ task }: TaskActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClose() {
    setLoading(true);
    try {
      await closeTask(task.id);
      toast.success("Task closed");
      router.refresh();
    } catch {
      toast.error("Failed to close task");
    } finally {
      setLoading(false);
    }
  }

  async function handleReopen() {
    setLoading(true);
    try {
      await reopenTask(task.id);
      toast.success("Task reopened");
      router.refresh();
    } catch {
      toast.error("Failed to reopen task");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
      router.push("/tasks");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
        >
          <MoreHorizontal className="h-4 w-4" />
          Actions
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEdit(true)} className="flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Edit Task
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {task.status !== "CLOSED" ? (
            <DropdownMenuItem onClick={handleClose} className="flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Close Task
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleReopen} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Reopen Task
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDelete(true)}
            className="text-destructive flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" /> Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskForm open={showEdit} onOpenChange={setShowEdit} task={task} />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{task.title}&rdquo; and all its notes.
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
