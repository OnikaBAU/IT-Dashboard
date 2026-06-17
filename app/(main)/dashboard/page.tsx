import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { TaskChart } from "@/components/dashboard/task-chart";
import { getDashboardStats, getTaskStatusCounts, getUpcomingTasks } from "@/lib/actions/tasks";
import { getRecentActivity } from "@/lib/actions/activity";

export default async function DashboardPage() {
  const [stats, statusCounts, upcomingTasks, recentActivity] = await Promise.all([
    getDashboardStats(),
    getTaskStatusCounts(),
    getUpcomingTasks(5),
    getRecentActivity(10),
  ]);

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">
        <StatsCards stats={stats} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <TaskChart data={statusCounts} />
          </div>
          <div className="lg:col-span-2">
            <UpcomingTasks tasks={upcomingTasks as Parameters<typeof UpcomingTasks>[0]["tasks"]} />
          </div>
        </div>
        <RecentActivity activities={recentActivity as Parameters<typeof RecentActivity>[0]["activities"]} />
      </main>
    </div>
  );
}
