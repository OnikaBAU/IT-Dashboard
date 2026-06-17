"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Priority, Status } from "../generated/prisma/enums";
import { logActivity } from "@/lib/actions/activity";

async function generateTicketNumber(): Promise<string> {
  const count = await prisma.task.count();
  return `TKT-${String(count + 1).padStart(5, "0")}`;
}

export async function getTasks(filters?: {
  search?: string;
  status?: Status;
  priority?: Priority;
  userId?: string;
  assignedTo?: string;
}) {
  const { search, status, priority, userId, assignedTo } = filters ?? {};
  return prisma.task.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { ticketNumber: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { assignedTo: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        status ? { status } : {},
        priority ? { priority } : {},
        userId ? { userId } : {},
        assignedTo && assignedTo !== "all"
          ? { assignedTo: { contains: assignedTo, mode: "insensitive" } }
          : {},
      ],
    },
    include: { user: { select: { id: true, fullName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      notes: {
        include: { author: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: "asc" },
      },
      activityLogs: {
        include: { user: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function createTask(data: {
  userId?: string;
  title: string;
  description?: string;
  category?: string;
  priority?: Priority;
  assignedTo?: string;
  dueDate?: Date;
}) {
  const ticketNumber = await generateTicketNumber();
  const task = await prisma.task.create({
    data: { ...data, ticketNumber },
    include: { user: { select: { id: true, fullName: true } } },
  });
  await logActivity({
    action: "TASK_CREATED",
    entityType: "Task",
    entityId: task.id,
    taskId: task.id,
    userId: data.userId,
    details: `Task "${task.title}" (${task.ticketNumber}) was created`,
  });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task;
}

export async function updateTask(
  id: string,
  data: {
    userId?: string | null;
    title?: string;
    description?: string;
    category?: string;
    priority?: Priority;
    status?: Status;
    assignedTo?: string;
    dueDate?: Date | null;
  }
) {
  const prev = await prisma.task.findUnique({ where: { id } });
  const task = await prisma.task.update({
    where: { id },
    data,
    include: { user: { select: { id: true, fullName: true } } },
  });

  const changes: string[] = [];
  if (prev?.status !== task.status) changes.push(`status → ${task.status}`);
  if (prev?.priority !== task.priority) changes.push(`priority → ${task.priority}`);
  if (prev?.assignedTo !== task.assignedTo)
    changes.push(`assigned to → ${task.assignedTo ?? "unassigned"}`);

  await logActivity({
    action: "TASK_UPDATED",
    entityType: "Task",
    entityId: id,
    taskId: id,
    details:
      changes.length > 0
        ? `Task "${task.title}" updated: ${changes.join(", ")}`
        : `Task "${task.title}" was updated`,
  });

  if (data.assignedTo && data.assignedTo !== prev?.assignedTo) {
    await logActivity({
      action: "TASK_ASSIGNED",
      entityType: "Task",
      entityId: id,
      taskId: id,
      details: `Task "${task.title}" assigned to ${data.assignedTo}`,
    });
  }

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  revalidatePath("/dashboard");
  return task;
}

export async function closeTask(id: string) {
  const task = await prisma.task.update({
    where: { id },
    data: { status: "CLOSED" },
  });
  await logActivity({
    action: "TASK_CLOSED",
    entityType: "Task",
    entityId: id,
    taskId: id,
    details: `Task "${task.title}" (${task.ticketNumber}) was closed`,
  });
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  revalidatePath("/dashboard");
  return task;
}

export async function reopenTask(id: string) {
  const task = await prisma.task.update({
    where: { id },
    data: { status: "OPEN" },
  });
  await logActivity({
    action: "TASK_REOPENED",
    entityType: "Task",
    entityId: id,
    taskId: id,
    details: `Task "${task.title}" (${task.ticketNumber}) was reopened`,
  });
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  revalidatePath("/dashboard");
  return task;
}

export async function deleteTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  await prisma.task.delete({ where: { id } });
  await logActivity({
    action: "TASK_DELETED",
    entityType: "Task",
    entityId: id,
    details: `Task "${task?.title}" (${task?.ticketNumber}) was deleted`,
  });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function getDashboardStats() {
  const [totalUsers, openTasks, inProgressTasks, completedTasks, highPriorityTasks] =
    await Promise.all([
      prisma.user.count(),
      prisma.task.count({ where: { status: "OPEN" } }),
      prisma.task.count({ where: { status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
      prisma.task.count({
        where: {
          priority: { in: ["HIGH", "CRITICAL"] },
          status: { notIn: ["CLOSED", "RESOLVED"] },
        },
      }),
    ]);
  return { totalUsers, openTasks, inProgressTasks, completedTasks, highPriorityTasks };
}

export async function getTaskStatusCounts() {
  const counts = await prisma.task.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  return counts.map((c: { status: Status; _count: { status: number } }) => ({
    status: c.status,
    count: c._count.status,
  }));
}

export async function getUpcomingTasks(limit = 5) {
  return prisma.task.findMany({
    where: {
      dueDate: { not: null, gte: new Date() },
      status: { notIn: ["CLOSED", "RESOLVED"] },
    },
    include: { user: { select: { id: true, fullName: true } } },
    orderBy: { dueDate: "asc" },
    take: limit,
  });
}
