import { Sidebar } from "@/components/layout/sidebar";

export const dynamic = "force-dynamic";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64 max-md:pl-0">
        {children}
      </div>
    </div>
  );
}
