"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Send, Trash2, MessageSquare, Paperclip, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { addTaskNote, deleteTaskNote } from "@/lib/actions/notes";
import type { TaskNoteWithAuthor } from "@/lib/types";

interface TaskNotesProps {
  taskId: string;
  notes: TaskNoteWithAuthor[];
}

interface PendingImage {
  objectUrl: string;
  file: File;
}

export function TaskNotes({ taskId, notes }: TaskNotesProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const next = files.map((f) => ({ objectUrl: URL.createObjectURL(f), file: f }));
    setPending((prev) => [...prev, ...next].slice(0, 5));
    e.target.value = "";
  }

  function removePending(index: number) {
    setPending((prev) => {
      URL.revokeObjectURL(prev[index].objectUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function uploadImages(): Promise<string[]> {
    return Promise.all(
      pending.map(async ({ file }) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("taskId", taskId);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error ?? "Upload failed");
        }
        const { url } = await res.json();
        return url as string;
      })
    );
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim() && pending.length === 0) return;
    setLoading(true);
    try {
      const imageUrls = pending.length > 0 ? await uploadImages() : [];
      await addTaskNote({ taskId, content: content.trim(), imageUrls });
      setContent("");
      setPending([]);
      toast.success("Note added");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add note");
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

        {/* Pending image previews */}
        {pending.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {pending.map((img, i) => (
              <div key={img.objectUrl} className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.objectUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="hidden"
              onChange={pickFiles}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => fileRef.current?.click()}
              disabled={pending.length >= 5}
            >
              <Paperclip className="h-4 w-4" />
              <span className="text-xs">Attach image{pending.length > 0 ? ` (${pending.length}/5)` : ""}</span>
            </Button>
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={loading || (!content.trim() && pending.length === 0)}
            className="gap-2"
          >
            <Send className="h-3.5 w-3.5" />
            {loading ? "Saving..." : "Add Note"}
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
                {note.content && (
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                )}
                {note.imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.imageUrls.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setLightbox(url)}
                        className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-md border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                          <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl p-2 bg-black/90 border-0">
          {lightbox && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lightbox} alt="" className="max-h-[85vh] w-full object-contain rounded" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
