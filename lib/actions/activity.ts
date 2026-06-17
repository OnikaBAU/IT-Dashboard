"use server";

import { prisma } from "@/lib/prisma";

export async function logActivity(data: {
  action: string;
  entityType: string;
  entityId?: string;
  taskId?: string;
  userId?: string;
  details?: string;
}) {
  return prisma.activityLog.create({ data });
}

export async function getActivityLogs(search?: string, limit = 50) {
  return prisma.activityLog.findMany({
    where: search
      ? {
          OR: [
            { action: { contains: search, mode: "insensitive" } },
            { details: { contains: search, mode: "insensitive" } },
            { entityType: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      user: { select: { id: true, fullName: true } },
      task: { select: { id: true, ticketNumber: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getRecentActivity(limit = 10) {
  return prisma.activityLog.findMany({
    include: {
      user: { select: { id: true, fullName: true } },
      task: { select: { id: true, ticketNumber: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
