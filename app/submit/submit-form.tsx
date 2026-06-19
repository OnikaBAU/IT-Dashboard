"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { submitTicket } from "@/lib/actions/submit";
import { TASK_CATEGORIES } from "@/lib/types";

interface Props {
  staff: { id: string; fullName: string }[];
}

export function SubmitForm({ staff }: Props) {
  const [userId, setUserId] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{ ticketNumber: string } | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { setError("Please select your name."); return; }
    if (!title.trim()) { setError("Please enter a title."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await submitTicket({
        userId,
        title: title.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        priority,
      });
      setSubmitted(result);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
          <CheckCircle className="h-12 w-12 text-primary" />
          <div>
            <p className="text-lg font-semibold">Ticket submitted!</p>
            <p className="text-muted-foreground text-sm mt-1">
              Your reference number is{" "}
              <span className="font-mono font-semibold text-foreground">{submitted.ticketNumber}</span>.
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              The IT team has been notified and will be in touch shortly.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(null);
              setTitle("");
              setDescription("");
              setUserId("");
              setCategory("");
              setPriority("MEDIUM");
            }}
          >
            Submit another request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Who are you */}
          <div className="space-y-1.5">
            <Label>Your name *</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select your name" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Issue title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Laptop won't connect to Wi-Fi"
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category || "none"} onValueChange={(v) => setCategory(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General</SelectItem>
                  {TASK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low — minor inconvenience</SelectItem>
                  <SelectItem value="MEDIUM">Medium — affecting work</SelectItem>
                  <SelectItem value="HIGH">High — blocking work</SelectItem>
                  <SelectItem value="CRITICAL">Critical — system down</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any extra details — error messages, when it started, steps to reproduce..."
              rows={4}
              className="resize-none"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
