"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTasks } from "@/lib/actions/tasks";
import type { Priority, Status, TaskWithUser } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithUser[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const data = await getTasks({
      search: search || undefined,
      status: status !== "all" ? (status as Status) : undefined,
      priority: priority !== "all" ? (priority as Priority) : undefined,
    });
    setTasks(data as TaskWithUser[]);
    setLoading(false);
  }, [search, status, priority]);

  useEffect(() => {
    const timeout = setTimeout(fetchTasks, 300);
    return () => clearTimeout(timeout);
  }, [fetchTasks]);

  return (
    <div className="flex flex-col">
      <Header title="Task Management" />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3 flex-wrap max-w-2xl">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="WAITING">Waiting</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => setPriority(v ?? "all")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} found`}
        </div>

        {!loading && <TaskTable tasks={tasks} />}

        <TaskForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) fetchTasks();
          }}
        />
      </main>
    </div>
  );
}
