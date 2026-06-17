"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getActivityLogs } from "@/lib/actions/activity";
import type { ActivityLogWithRelations } from "@/lib/types";

const ACTION_META: Record<string, { label: string; color: string }> = {
  USER_CREATED: { label: "User Created", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  USER_UPDATED: { label: "User Updated", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  USER_DELETED: { label: "User Deleted", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  TASK_CREATED: { label: "Task Created", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  TASK_UPDATED: { label: "Task Updated", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  TASK_ASSIGNED: { label: "Task Assigned", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  TASK_CLOSED: { label: "Task Closed", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  TASK_REOPENED: { label: "Task Reopened", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  TASK_DELETED: { label: "Task Deleted", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  NOTE_ADDED: { label: "Note Added", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLogWithRelations[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const data = await getActivityLogs(search || undefined, 200);
    setLogs(data as ActivityLogWithRelations[]);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timeout);
  }, [fetchLogs]);

  const grouped = logs.reduce<Record<string, ActivityLogWithRelations[]>>((acc, log) => {
    const date = format(new Date(log.createdAt), "MMMM d, yyyy");
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div className="flex flex-col">
      <Header title="Activity Log" />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${logs.length} entries`}
          </p>
        </div>

        {!loading && logs.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No activity found</p>
            <p className="text-sm mt-1">Activity will appear here as you use the system</p>
          </div>
        )}

        {!loading &&
          Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-16 bg-background py-1">
                {date}
              </h2>
              <Card>
                <CardContent className="pt-4 divide-y">
                  {entries.map((log) => {
                    const meta = ACTION_META[log.action] ?? {
                      label: log.action,
                      color: "bg-gray-100 text-gray-800",
                    };
                    return (
                      <div key={log.id} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5 w-20 shrink-0">
                          {format(new Date(log.createdAt), "h:mm a")}
                        </span>
                        <Badge className={`text-xs shrink-0 ${meta.color}`}>{meta.label}</Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{log.details}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            {log.task && (
                              <Link
                                href={`/tasks/${log.task.id}`}
                                className="hover:text-primary hover:underline"
                              >
                                {log.task.ticketNumber}
                              </Link>
                            )}
                            {log.user && log.task && <span>·</span>}
                            {log.user && (
                              <Link
                                href={`/users/${log.user.id}`}
                                className="hover:text-primary hover:underline"
                              >
                                {log.user.fullName}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          ))}
      </main>
    </div>
  );
}
