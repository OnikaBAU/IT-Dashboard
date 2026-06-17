"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/actions/activity";

export async function addTaskNote(data: {
  taskId: string;
  authorId?: string;
  content: string;
  imageUrls?: string[];
}) {
  const task = await prisma.task.findUnique({ where: { id: data.taskId } });
  const note = await prisma.taskNote.create({
    data: { ...data, imageUrls: data.imageUrls ?? [] },
    include: { author: { select: { id: true, fullName: true } } },
  });
  await logActivity({
    action: "NOTE_ADDED",
    entityType: "Task",
    entityId: data.taskId,
    taskId: data.taskId,
    userId: data.authorId,
    details: `Note added to task "${task?.title}" (${task?.ticketNumber})`,
  });
  revalidatePath(`/tasks/${data.taskId}`);
  return note;
}

export async function deleteTaskNote(id: string, taskId: string) {
  await prisma.taskNote.delete({ where: { id } });
  revalidatePath(`/tasks/${taskId}`);
}
