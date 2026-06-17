import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Tag, Wrench } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TaskNotes } from "@/components/tasks/task-notes";
import { TaskActions } from "@/components/tasks/task-actions";
import { getTaskById } from "@/lib/actions/tasks";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from "@/lib/types";
import type { TaskNoteWithAuthor, ActivityLogWithRelations } from "@/lib/types";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTaskById(id);
  if (!task) notFound();

  return (
    <div className="flex flex-col">
      <Header title={task.ticketNumber} />
      <main className="flex-1 p-6 space-y-6">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-1">{task.ticketNumber}</p>
                    <CardTitle className="text-xl">{task.title}</CardTitle>
                  </div>
                  <TaskActions task={task} />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={`${PRIORITY_COLORS[task.priority]}`}>
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                  <Badge className={`${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </Badge>
                  {task.category && (
                    <Badge variant="outline">{task.category}</Badge>
                  )}
                </div>
              </CardHeader>
              {task.description && (
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardContent className="pt-6">
                <TaskNotes
                  taskId={task.id}
                  notes={task.notes as TaskNoteWithAuthor[]}
                />
              </CardContent>
            </Card>

            {/* Activity Log */}
            {task.activityLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(task.activityLogs as ActivityLogWithRelations[]).map((log) => (
                      <div key={log.id} className="flex gap-3 text-sm">
                        <span className="text-muted-foreground whitespace-nowrap text-xs pt-0.5">
                          {format(new Date(log.createdAt), "MMM d, h:mm a")}
                        </span>
                        <span>{log.details}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Requester</p>
                    {task.user ? (
                      <Link
                        href={`/users/${task.user.id}`}
                        className="text-sm font-medium hover:text-primary hover:underline"
                      >
                        {task.user.fullName}
                      </Link>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not assigned</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned Technician</p>
                    <p className="text-sm font-medium">{task.assignedTo ?? "—"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{task.category ?? "—"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="text-sm font-medium">
                      {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "—"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm">{format(new Date(task.createdAt), "MMM d, yyyy · h:mm a")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{format(new Date(task.updatedAt), "MMM d, yyyy · h:mm a")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
