import DocsSidebar from "./components/DocsSidebar";
import SimpleNavbar from "@/components/SimpleNavbar";

export const metadata = {
  title: "Documentation - Tackleit",
  description: "Learn how to easily set up and understand Tackleit.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[--background] flex flex-col">
      <SimpleNavbar />

      <div className="flex flex-1 overflow-visible pt-24 lg:pt-32 max-w-7xl mx-auto w-full">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-32 h-[calc(100vh-8rem)]">
          <DocsSidebar />
        </aside>

        {/* Note: In a fully responsive design, we might add a mobile sidebar drawer here.
            For now, we will rely on the clean desktop layout or inline mobile menu. */}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 min-h-[calc(100vh-6rem)] relative">
          {/* A soft decorative element */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[--primary] opacity-5 blur-[120px] rounded-full pointer-events-none -z-10" />
          
          <div className="prose dark:prose-invert max-w-4xl prose-headings:font-bold prose-a:text-[--primary] hover:prose-a:text-[--primary]/80 prose-code:text-[--primary] prose-code:bg-[--primary]/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
