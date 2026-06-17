import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Mail, Phone, Building2, Briefcase, CalendarDays } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getUserById } from "@/lib/actions/users";
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/types";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  const initials = user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col">
      <Header title="User Profile" />
      <main className="flex-1 p-6 space-y-6">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{user.fullName}</h2>
                {user.position && (
                  <p className="text-sm text-muted-foreground mt-1">{user.position}</p>
                )}
                {user.department && (
                  <Badge variant="secondary" className="mt-2">{user.department}</Badge>
                )}
              </div>
              <Separator className="my-6" />
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${user.email}`} className="hover:text-primary truncate">
                    {user.email}
                  </a>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{user.department}</span>
                  </div>
                )}
                {user.position && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{user.position}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Joined {format(new Date(user.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
              {user.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{user.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Assigned Tasks
                  <Badge variant="outline">{user._count.tasks}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No tasks assigned</p>
                ) : (
                  <div className="space-y-2">
                    {user.tasks.map((task) => (
                      <Link key={task.id} href={`/tasks/${task.id}`} className="block">
                        <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-muted-foreground">
                                {task.ticketNumber}
                              </span>
                              <span className="font-medium text-sm truncate">{task.title}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              {task.assignedTo && <span>Assigned to: {task.assignedTo}</span>}
                              <span>·</span>
                              <span>{format(new Date(task.createdAt), "MMM d, yyyy")}</span>
                              {task.dueDate && (
                                <>
                                  <span>·</span>
                                  <span>Due {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                              {PRIORITY_LABELS[task.priority]}
                            </Badge>
                            <Badge className={`text-xs ${STATUS_COLORS[task.status]}`}>
                              {STATUS_LABELS[task.status]}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
