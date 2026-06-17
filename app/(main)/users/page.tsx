"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Header } from "@/components/layout/header";
import { UserTable } from "@/components/users/user-table";
import { UserForm } from "@/components/users/user-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUsers, getDepartments } from "@/lib/actions/users";
import type { UserWithTaskCount } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithTaskCount[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const data = await getUsers(search || undefined, department);
    setUsers(data as UserWithTaskCount[]);
    setLoading(false);
  }, [search, department]);

  useEffect(() => {
    getDepartments().then(setDepartments);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  return (
    <div className="flex flex-col">
      <Header title="User Management" />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={department} onValueChange={(v) => setDepartment(v ?? "all")}>
              <SelectTrigger className="w-44">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${users.length} user${users.length !== 1 ? "s" : ""} found`}
        </div>

        {!loading && <UserTable users={users} />}

        <UserForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) fetchUsers();
          }}
        />
      </main>
    </div>
  );
}
