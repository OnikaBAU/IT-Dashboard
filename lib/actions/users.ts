"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/actions/activity";

export async function getUsers(search?: string, department?: string) {
  return prisma.user.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { department: { contains: search, mode: "insensitive" } },
                { position: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        department && department !== "all"
          ? { department: { equals: department, mode: "insensitive" } }
          : {},
      ],
    },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { user: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { tasks: true } },
    },
  });
}

export async function createUser(data: {
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  notes?: string;
}) {
  const user = await prisma.user.create({ data });
  await logActivity({
    action: "USER_CREATED",
    entityType: "User",
    entityId: user.id,
    userId: user.id,
    details: `User "${user.fullName}" was created`,
  });
  revalidatePath("/users");
  return user;
}

export async function updateUser(
  id: string,
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    department?: string;
    position?: string;
    notes?: string;
  }
) {
  const user = await prisma.user.update({ where: { id }, data });
  await logActivity({
    action: "USER_UPDATED",
    entityType: "User",
    entityId: id,
    userId: id,
    details: `User "${user.fullName}" was updated`,
  });
  revalidatePath("/users");
  revalidatePath(`/users/${id}`);
  return user;
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  await prisma.user.delete({ where: { id } });
  await logActivity({
    action: "USER_DELETED",
    entityType: "User",
    entityId: id,
    details: `User "${user?.fullName}" was deleted`,
  });
  revalidatePath("/users");
}

export async function getDepartments() {
  const users = await prisma.user.findMany({
    select: { department: true },
    distinct: ["department"],
    where: { department: { not: null } },
  });
  return users
    .map((u: { department: string | null }) => u.department)
    .filter(Boolean) as string[];
}
