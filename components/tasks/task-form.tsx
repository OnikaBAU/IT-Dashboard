"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createTask, updateTask } from "@/lib/actions/tasks";
import { getUsers } from "@/lib/actions/users";
import { TASK_CATEGORIES } from "@/lib/types";
import type { Priority, Status, TaskWithUser } from "@/lib/types";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithUser | null;
  defaultUserId?: string;
}

export function TaskForm({ open, onOpenChange, task, defaultUserId }: TaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; fullName: string }[]>([]);
  const [userId, setUserId] = useState<string>(task?.userId ?? defaultUserId ?? "none");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "MEDIUM");
  const [status, setStatus] = useState<Status>(task?.status ?? "OPEN");
  const [category, setCategory] = useState<string>(task?.category ?? "");

  useEffect(() => {
    if (open) {
      getUsers().then((u) =>
        setUsers(u.map((x: { id: string; fullName: string }) => ({ id: x.id, fullName: x.fullName })))
      );
      setUserId(task?.userId ?? defaultUserId ?? "none");
      setPriority(task?.priority ?? "MEDIUM");
      setStatus(task?.status ?? "OPEN");
      setCategory(task?.category ?? "");
    }
  }, [open, task, defaultUserId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const dueDateVal = (form.elements.namedItem("dueDate") as HTMLInputElement).value;
    const data = {
      userId: userId === "none" ? undefined : userId,
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value || undefined,
      category: category || undefined,
      priority,
      status,
      assignedTo: (form.elements.namedItem("assignedTo") as HTMLInputElement).value || undefined,
      dueDate: dueDateVal ? new Date(dueDateVal) : undefined,
    };
    try {
      if (task) {
        await updateTask(task.id, data);
        toast.success("Task updated");
      } else {
        await createTask(data);
        toast.success("Task created");
      }
      onOpenChange(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? `Edit Task — ${task.ticketNumber}` : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" defaultValue={task?.title} placeholder="Brief description of the issue" required />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={task?.description ?? ""} placeholder="Detailed description..." rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>User / Requester</Label>
              <Select value={userId} onValueChange={(v) => setUserId(v ?? "none")}>
                <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No user</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category || "none"} onValueChange={(v) => setCategory(v === "none" ? "" : (v ?? ""))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {TASK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority((v ?? "MEDIUM") as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus((v ?? "OPEN") as Status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="WAITING">Waiting</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignedTo">Assigned Technician</Label>
              <Input id="assignedTo" name="assignedTo" defaultValue={task?.assignedTo ?? ""} placeholder="Technician name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date"
                defaultValue={task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
