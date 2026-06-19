import { getUsers } from "@/lib/actions/users";
import { SubmitForm } from "./submit-form";

export default async function SubmitPage() {
  const users = await getUsers();
  const staffList = users.map((u) => ({ id: u.id, fullName: u.fullName }));

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Log an IT Support Request</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Fill in the details below and our IT team will be notified immediately.
        </p>
      </div>
      <SubmitForm staff={staffList} />
    </div>
  );
}
