"use server";

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/actions/activity";
import { Resend } from "resend";

const NOTIFY_EMAIL = "onika@sabullion.co.za";

async function generateTicketNumber(): Promise<string> {
  const count = await prisma.task.count();
  return `TKT-${String(count + 1).padStart(5, "0")}`;
}

export async function submitTicket(data: {
  userId: string;
  title: string;
  description?: string;
  category?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}) {
  const ticketNumber = await generateTicketNumber();

  const task = await prisma.task.create({
    data: {
      ticketNumber,
      userId: data.userId,
      title: data.title,
      description: data.description,
      category: data.category || null,
      priority: data.priority,
      status: "OPEN",
    },
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });

  await logActivity({
    action: "TASK_CREATED",
    entityType: "Task",
    entityId: task.id,
    taskId: task.id,
    userId: data.userId,
    details: `Task "${task.title}" (${task.ticketNumber}) submitted by ${task.user?.fullName}`,
  });

  // Send email notification — fails silently if RESEND_API_KEY is not set
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "IT Dashboard <no-reply@sabullion.co.za>",
        to: NOTIFY_EMAIL,
        subject: `[${ticketNumber}] New IT ticket: ${task.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <div style="background:#4A5C2F;padding:20px 24px;border-radius:8px 8px 0 0">
              <h2 style="color:#fff;margin:0;font-size:18px">New IT Support Ticket</h2>
              <p style="color:#C9A84C;margin:4px 0 0;font-family:monospace;font-size:14px">${ticketNumber}</p>
            </div>
            <div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px">
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr><td style="padding:6px 0;color:#666;width:120px">Submitted by</td><td style="padding:6px 0;font-weight:600">${task.user?.fullName ?? "Unknown"}</td></tr>
                <tr><td style="padding:6px 0;color:#666">Title</td><td style="padding:6px 0;font-weight:600">${task.title}</td></tr>
                <tr><td style="padding:6px 0;color:#666">Category</td><td style="padding:6px 0">${task.category ?? "—"}</td></tr>
                <tr><td style="padding:6px 0;color:#666">Priority</td><td style="padding:6px 0">${task.priority}</td></tr>
                ${task.description ? `<tr><td style="padding:6px 0;color:#666;vertical-align:top">Description</td><td style="padding:6px 0;white-space:pre-wrap">${task.description}</td></tr>` : ""}
              </table>
              <div style="margin-top:20px">
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://it-dashboard-plum.vercel.app"}/tasks/${task.id}"
                   style="background:#4A5C2F;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
                  View Ticket →
                </a>
              </div>
            </div>
          </div>
        `,
      });
    } catch {
      // Email failure should not break ticket submission
    }
  }

  return { ticketNumber, taskId: task.id };
}
