import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function PageLayout({ children, withFooter = true }: { children: ReactNode; withFooter?: boolean }) {
  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      {withFooter && <Footer />}
    </div>
  );
}
