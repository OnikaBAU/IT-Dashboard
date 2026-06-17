import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/types";
import type { TaskWithUser } from "@/lib/types";

interface UpcomingTasksProps {
  tasks: TaskWithUser[];
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Due Tasks</CardTitle>
        <Link href="/tasks" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No upcoming tasks</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const daysLeft = task.dueDate
                ? differenceInDays(new Date(task.dueDate), new Date())
                : null;
              return (
                <Link key={task.id} href={`/tasks/${task.id}`} className="block">
                  <div className="flex items-start justify-between gap-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {task.ticketNumber}
                        {task.user && ` · ${task.user.fullName}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>
                      {task.dueDate && (
                        <span
                          className={`text-xs font-medium ${
                            daysLeft !== null && daysLeft <= 2
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {format(new Date(task.dueDate), "MMM d")}
                          {daysLeft !== null &&
                            ` (${daysLeft === 0 ? "today" : daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`})`}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
