import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ActivityLogWithRelations } from "@/lib/types";

const ACTION_ICONS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  USER_CREATED: { label: "User Created", variant: "default" },
  USER_UPDATED: { label: "User Updated", variant: "secondary" },
  USER_DELETED: { label: "User Deleted", variant: "destructive" },
  TASK_CREATED: { label: "Task Created", variant: "default" },
  TASK_UPDATED: { label: "Task Updated", variant: "secondary" },
  TASK_ASSIGNED: { label: "Task Assigned", variant: "outline" },
  TASK_CLOSED: { label: "Task Closed", variant: "secondary" },
  TASK_REOPENED: { label: "Task Reopened", variant: "outline" },
  TASK_DELETED: { label: "Task Deleted", variant: "destructive" },
  NOTE_ADDED: { label: "Note Added", variant: "outline" },
};

interface RecentActivityProps {
  activities: ActivityLogWithRelations[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Link href="/activity" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No activity yet</p>
        ) : (
          <div className="space-y-4">
            {activities.map((log) => {
              const meta = ACTION_ICONS[log.action] ?? { label: log.action, variant: "outline" as const };
              return (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Badge variant={meta.variant} className="text-xs whitespace-nowrap">
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{log.details}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
