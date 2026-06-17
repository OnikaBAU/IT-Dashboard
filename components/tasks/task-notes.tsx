"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Send, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { addTaskNote, deleteTaskNote } from "@/lib/actions/notes";
import type { TaskNoteWithAuthor } from "@/lib/types";

interface TaskNotesProps {
  taskId: string;
  notes: TaskNoteWithAuthor[];
}

export function TaskNotes({ taskId, notes }: TaskNotesProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await addTaskNote({ taskId, content: content.trim() });
      setContent("");
      toast.success("Note added");
      router.refresh();
    } catch {
      toast.error("Failed to add note");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(noteId: string) {
    try {
      await deleteTaskNote(noteId, taskId);
      toast.success("Note deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete note");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium">Activity Notes</h3>
        <span className="text-xs text-muted-foreground">({notes.length})</span>
      </div>

      {/* Note input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add a note — e.g. Phone call completed, Awaiting response, Escalated to vendor..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={loading || !content.trim()} className="gap-2">
            <Send className="h-3.5 w-3.5" />
            {loading ? "Adding..." : "Add Note"}
          </Button>
        </div>
      </form>

      {/* Notes timeline */}
      {notes.length === 0 ? (
        <p className="text-center text-muted-foreground py-6 text-sm">
          No notes yet. Add the first note above.
        </p>
      ) : (
        <div className="relative space-y-4 pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-border">
          {notes.map((note) => (
            <div key={note.id} className="relative">
              <div className="absolute -left-6 top-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {note.author
                      ? note.author.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                      : "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {note.author?.fullName ?? "Unknown"}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.createdAt), "MMM d, yyyy · h:mm a")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
