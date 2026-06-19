export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-sidebar border-b border-sidebar-border px-6 py-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-sidebar-primary flex items-center justify-center">
          <span className="text-sidebar-primary-foreground font-bold text-sm">IT</span>
        </div>
        <span className="text-sidebar-foreground font-semibold text-lg">SA Bullion IT Support</span>
      </header>
      <main className="flex-1 flex items-start justify-center p-6 pt-12">
        {children}
      </main>
    </div>
  );
}
