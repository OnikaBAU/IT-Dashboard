export async function generateWeeklyReport(tasks: any[]) {
  const completed = tasks.filter(t => t.status === "done").length
  const pending = tasks.filter(t => t.status !== "done").length

  return {
    total: tasks.length,
    completed,
    pending,
    summary: `This week: ${completed} completed, ${pending} pending`
  }
}
