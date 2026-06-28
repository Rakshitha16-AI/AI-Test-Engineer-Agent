import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full bg-background text-foreground overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <Header />
        <main className="flex-1 overflow-y-auto relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}